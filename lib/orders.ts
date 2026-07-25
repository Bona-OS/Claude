// Persistência de pedidos. Usa Supabase quando configurado; senão, cai num
// armazenamento em memória (apenas para desenvolvimento/demonstração).
import { randomUUID } from "crypto";
import type { CartLine, Fulfillment } from "./cart";
import { hasSupabase, supabaseAdmin } from "./supabase";

export type OrderStatus = "pending_payment" | "paid" | "received" | "cancelled";
export type PaymentMethod = "pix" | "on_delivery";

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  notes?: string;
  changeFor?: string; // "troco para"
}

export interface Order {
  id: string;
  status: OrderStatus;
  fulfillment: Fulfillment;
  paymentMethod: PaymentMethod;
  customer: CustomerInfo;
  items: CartLine[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  pixPaymentId?: string;
  pixCopiaECola?: string;
  pixQrBase64?: string;
  createdAt: string;
}

export type NewOrder = Omit<Order, "id" | "createdAt" | "status"> & {
  status?: OrderStatus;
};

// --- Fallback em memória (dev/demo) ---------------------------------------
const memory = new Map<string, Order>();

// --- Serialização Supabase ------------------------------------------------
type Row = {
  id: string;
  status: OrderStatus;
  fulfillment: Fulfillment;
  payment_method: PaymentMethod;
  customer: CustomerInfo;
  items: CartLine[];
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  pix_payment_id: string | null;
  pix_copia_e_cola: string | null;
  pix_qr_base64: string | null;
  created_at: string;
};

function rowToOrder(r: Row): Order {
  return {
    id: r.id,
    status: r.status,
    fulfillment: r.fulfillment,
    paymentMethod: r.payment_method,
    customer: r.customer,
    items: r.items,
    subtotalCents: r.subtotal_cents,
    deliveryFeeCents: r.delivery_fee_cents,
    totalCents: r.total_cents,
    pixPaymentId: r.pix_payment_id ?? undefined,
    pixCopiaECola: r.pix_copia_e_cola ?? undefined,
    pixQrBase64: r.pix_qr_base64 ?? undefined,
    createdAt: r.created_at,
  };
}

export async function createOrder(input: NewOrder): Promise<Order> {
  const order: Order = {
    ...input,
    id: randomUUID(),
    status: input.status ?? "pending_payment",
    createdAt: new Date().toISOString(),
  };

  if (!hasSupabase()) {
    memory.set(order.id, order);
    return order;
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("orders")
    .insert({
      id: order.id,
      status: order.status,
      fulfillment: order.fulfillment,
      payment_method: order.paymentMethod,
      customer: order.customer,
      items: order.items,
      subtotal_cents: order.subtotalCents,
      delivery_fee_cents: order.deliveryFeeCents,
      total_cents: order.totalCents,
      pix_payment_id: order.pixPaymentId ?? null,
      pix_copia_e_cola: order.pixCopiaECola ?? null,
      pix_qr_base64: order.pixQrBase64 ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToOrder(data as Row);
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!hasSupabase()) return memory.get(id) ?? null;
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as Row) : null;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (!hasSupabase()) {
    const o = memory.get(id);
    if (o) o.status = status;
    return;
  }
  const sb = supabaseAdmin();
  const { error } = await sb.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function findOrderByPixPaymentId(paymentId: string): Promise<Order | null> {
  if (!hasSupabase()) {
    for (const o of memory.values()) if (o.pixPaymentId === paymentId) return o;
    return null;
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .eq("pix_payment_id", paymentId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as Row) : null;
}
