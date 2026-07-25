import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/mercadopago";
import { findOrderByPixPaymentId, updateOrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

// Webhook do Mercado Pago. Ao receber uma notificação de pagamento, confirmamos
// o status na API (fonte da verdade) e marcamos o pedido como pago se aprovado.
// Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // O MP às vezes manda os dados via querystring; tratamos abaixo.
  }

  const url = new URL(req.url);
  const type = body?.type || url.searchParams.get("type") || url.searchParams.get("topic");
  const paymentId =
    body?.data?.id || url.searchParams.get("data.id") || url.searchParams.get("id");

  if (type && !String(type).includes("payment")) {
    return NextResponse.json({ ok: true, ignored: type });
  }
  if (!paymentId) {
    return NextResponse.json({ ok: true, ignored: "sem id" });
  }

  try {
    const status = await getPaymentStatus(String(paymentId));
    if (status === "approved") {
      const order = await findOrderByPixPaymentId(String(paymentId));
      if (order && order.status !== "paid") {
        await updateOrderStatus(order.id, "paid");
      }
    }
  } catch (err: any) {
    console.error("[payments/webhook] erro:", err?.message || err);
    // Responder 200 evita reentrega infinita; erros ficam no log.
  }

  return NextResponse.json({ ok: true });
}
