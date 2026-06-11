import { NextRequest, NextResponse } from "next/server";
import { downloadMedia, sendText, sendImageByLink } from "@/lib/whatsapp";
import { restorePhoto } from "@/lib/gemini";
import { supabaseAdmin, uploadPhoto } from "@/lib/supabase";
import { createPixCharge } from "@/lib/mercadopago";

export const runtime = "nodejs";
export const maxDuration = 60;

const PRICE = Number(process.env.PRICE_BRL || "29");

const WELCOME =
  "Oi! 👋 Aqui é a FotoRestaura.\n\n" +
  "Me manda *uma foto antiga, rasgada ou desbotada* aqui no WhatsApp que eu restauro pra você. " +
  "Você recebe o *antes e depois* na hora e só finaliza (via Pix) se gostar. 📸";

// --- Verificação do webhook (Meta chama via GET na configuração) ----------
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (
    p.get("hub.mode") === "subscribe" &&
    p.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new NextResponse(p.get("hub.challenge") || "", { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

// --- Recebimento de mensagens ---------------------------------------------
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    const value = (body as any)?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    if (msg) {
      const from = msg.from as string;
      const profileName = value?.contacts?.[0]?.profile?.name as string | undefined;
      if (msg.type === "image") {
        await handlePhoto(from, profileName, msg.image.id);
      } else {
        await sendText(from, WELCOME);
      }
    }
  } catch (e) {
    console.error("webhook error", e);
  }

  // A Meta exige 200 rápido. Para escala, mover o processamento pesado para
  // uma fila / Edge Function (ver docs/PLANO.md → "Escala").
  return NextResponse.json({ ok: true });
}

async function handlePhoto(from: string, name: string | undefined, mediaId: string) {
  const sb = supabaseAdmin();
  await sendText(from, "Recebi sua foto! 🪄 Já estou restaurando, leva menos de um minuto...");

  // 1. Cliente
  const { data: customer } = await sb
    .from("customers")
    .upsert({ wa_id: from, name }, { onConflict: "wa_id" })
    .select()
    .single();

  // 2. Baixa o original e guarda
  const original = await downloadMedia(mediaId);
  const stamp = Date.now();
  const originalUrl = await uploadPhoto(
    `originals/${from}/${stamp}.jpg`,
    original.bytes,
    original.mimeType
  );

  const { data: job } = await sb
    .from("jobs")
    .insert({
      customer_id: customer?.id,
      status: "processing",
      original_url: originalUrl,
      price_cents: PRICE * 100,
    })
    .select()
    .single();

  // 3. Restaura com o Gemini (Nano Banana)
  let restoredUrl: string;
  try {
    const restored = await restorePhoto(original.bytes, original.mimeType, { colorize: false });
    restoredUrl = await uploadPhoto(`restored/${from}/${stamp}.png`, restored.bytes, restored.mimeType);
  } catch (e) {
    console.error("restore error", e);
    await sb.from("jobs").update({ status: "failed" }).eq("id", job?.id);
    await sendText(from, "Ops, tive um problema pra restaurar essa foto. Pode me mandar de novo? 🙏");
    return;
  }

  // 4. Gera a cobrança Pix
  let copiaECola: string | undefined;
  try {
    const pix = await createPixCharge({
      amount: PRICE,
      description: "Restauração de foto - FotoRestaura",
      externalReference: job?.id,
    });
    copiaECola = pix.copiaECola;
    await sb.from("payments").insert({
      job_id: job?.id,
      provider_id: pix.id,
      amount_cents: PRICE * 100,
      status: "pending",
    });
  } catch (e) {
    console.error("pix error", e);
  }

  // 5. Entrega o antes/depois + Pix
  await sb.from("jobs").update({ status: "delivered", restored_url: restoredUrl }).eq("id", job?.id);
  await sendImageByLink(from, restoredUrl, "✨ Prontinho! Aqui está sua foto restaurada.");

  if (copiaECola) {
    await sendText(
      from,
      `Gostou? 💚 Pra liberar a versão final em alta resolução é só *R$ ${PRICE},00* no Pix.\n\n` +
        `Copia e cola o código abaixo no app do seu banco:\n\n${copiaECola}`
    );
  } else {
    await sendText(from, `Gostou? 💚 Me chama aqui que te passo o Pix pra finalizar (R$ ${PRICE},00).`);
  }
}
