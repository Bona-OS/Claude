import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Webhook do Mercado Pago: confirma o pagamento e marca o job como pago.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const paymentId = body?.data?.id || req.nextUrl.searchParams.get("data.id");
    const token = process.env.MP_ACCESS_TOKEN;

    if (paymentId && token) {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pay = await res.json();
      const sb = supabaseAdmin();

      await sb
        .from("payments")
        .update({ status: pay.status })
        .eq("provider_id", String(paymentId));

      if (pay.status === "approved" && pay.external_reference) {
        await sb.from("jobs").update({ status: "paid" }).eq("id", pay.external_reference);
      }
    }
  } catch (e) {
    console.error("payment webhook error", e);
  }
  return NextResponse.json({ ok: true });
}
