import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrderStatus } from "@/lib/orders";
import { getPaymentStatus } from "@/lib/mercadopago";

export const runtime = "nodejs";

// GET /api/orders/:id — usado pela página de acompanhamento para consultar o
// pedido e, quando o pagamento é Pix, checar se já foi aprovado.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (order.status === "pending_payment" && order.pixPaymentId) {
    const status = await getPaymentStatus(order.pixPaymentId);
    if (status === "approved") {
      await updateOrderStatus(order.id, "paid");
      order.status = "paid";
    }
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    fulfillment: order.fulfillment,
    paymentMethod: order.paymentMethod,
    items: order.items,
    subtotalCents: order.subtotalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    totalCents: order.totalCents,
    pix: order.pixCopiaECola
      ? { copiaECola: order.pixCopiaECola, qrBase64: order.pixQrBase64 }
      : null,
    customer: { name: order.customer.name },
    createdAt: order.createdAt,
  });
}
