import { NextRequest, NextResponse } from "next/server";
import {
  buildItemLine,
  buildPizzaLine,
  computeTotals,
  type CartLine,
  type Fulfillment,
} from "@/lib/cart";
import type { SizeId } from "@/lib/menu";
import { createOrder, type CustomerInfo, type PaymentMethod } from "@/lib/orders";
import { createPixCharge, hasMercadoPago } from "@/lib/mercadopago";
import { formatBRL } from "@/lib/format";
import { store } from "@/lib/store";

export const runtime = "nodejs";

interface IncomingLine {
  kind: "pizza" | "item";
  refId: string;
  qty: number;
  size?: SizeId;
  secondFlavor?: string;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const fulfillment: Fulfillment = body.fulfillment === "pickup" ? "pickup" : "delivery";
  const paymentMethod: PaymentMethod = body.paymentMethod === "pix" ? "pix" : "on_delivery";
  const rawItems: IncomingLine[] = Array.isArray(body.items) ? body.items : [];

  // Reconstrói cada linha a partir do cardápio — nunca confia no preço do cliente.
  const lines: CartLine[] = [];
  for (const it of rawItems) {
    const qty = Math.max(1, Math.min(50, Math.floor(Number(it.qty) || 0)));
    let line: CartLine | null = null;
    if (it.kind === "pizza") {
      line = buildPizzaLine(it.refId, (it.size as SizeId) || "grande", it.secondFlavor, qty);
    } else if (it.kind === "item") {
      line = buildItemLine(it.refId, qty);
    }
    if (!line) {
      return NextResponse.json({ error: `Item inválido no pedido: ${it.refId}` }, { status: 400 });
    }
    lines.push(line);
  }

  if (lines.length === 0) {
    return NextResponse.json({ error: "Seu carrinho está vazio." }, { status: 400 });
  }

  // Dados do cliente.
  const c = body.customer || {};
  const customer: CustomerInfo = {
    name: String(c.name || "").trim(),
    phone: String(c.phone || "").trim(),
    email: c.email ? String(c.email).trim() : undefined,
    address: c.address ? String(c.address).trim() : undefined,
    neighborhood: c.neighborhood ? String(c.neighborhood).trim() : undefined,
    notes: c.notes ? String(c.notes).trim() : undefined,
    changeFor: c.changeFor ? String(c.changeFor).trim() : undefined,
  };
  if (!customer.name || !customer.phone) {
    return NextResponse.json({ error: "Informe nome e telefone." }, { status: 400 });
  }
  if (fulfillment === "delivery" && !customer.address) {
    return NextResponse.json({ error: "Informe o endereço de entrega." }, { status: 400 });
  }

  const totals = computeTotals(lines, fulfillment);
  if (fulfillment === "delivery" && totals.subtotalCents < store.minOrderCents) {
    return NextResponse.json(
      { error: `Pedido mínimo para entrega é ${formatBRL(store.minOrderCents)}.` },
      { status: 400 }
    );
  }

  if (paymentMethod === "pix" && !hasMercadoPago()) {
    return NextResponse.json(
      { error: "Pagamento por Pix indisponível no momento. Escolha pagar na entrega." },
      { status: 400 }
    );
  }

  try {
    // Cria o pedido primeiro para ter o id como referência da cobrança.
    const order = await createOrder({
      fulfillment,
      paymentMethod,
      customer,
      items: lines,
      subtotalCents: totals.subtotalCents,
      deliveryFeeCents: totals.deliveryFeeCents,
      totalCents: totals.totalCents,
      status: paymentMethod === "pix" ? "pending_payment" : "received",
    });

    let pix = null;
    if (paymentMethod === "pix") {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
      const charge = await createPixCharge({
        amountCents: totals.totalCents,
        description: `Pedido ${order.id.slice(0, 8)} — ${store.brand}`,
        payerEmail: customer.email,
        payerName: customer.name,
        externalReference: order.id,
        notificationUrl: `${siteUrl}/api/payments/webhook`,
      });
      // Persiste os dados do Pix no pedido.
      order.pixPaymentId = charge.id;
      order.pixCopiaECola = charge.copiaECola;
      order.pixQrBase64 = charge.qrCodeBase64;
      const { hasSupabase, supabaseAdmin } = await import("@/lib/supabase");
      if (hasSupabase()) {
        await supabaseAdmin()
          .from("orders")
          .update({
            pix_payment_id: charge.id,
            pix_copia_e_cola: charge.copiaECola ?? null,
            pix_qr_base64: charge.qrCodeBase64 ?? null,
          })
          .eq("id", order.id);
      }
      pix = {
        copiaECola: charge.copiaECola,
        qrBase64: charge.qrCodeBase64,
        ticketUrl: charge.ticketUrl,
      };
    }

    return NextResponse.json({ id: order.id, status: order.status, pix }, { status: 201 });
  } catch (err: any) {
    console.error("[orders] erro ao criar pedido:", err?.message || err);
    return NextResponse.json(
      { error: "Não foi possível registrar o pedido. Tente novamente." },
      { status: 500 }
    );
  }
}
