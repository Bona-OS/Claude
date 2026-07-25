// Cobrança Pix via Mercado Pago.
// Docs: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
export interface PixCharge {
  id: string;
  qrCodeBase64?: string;
  copiaECola?: string;
  ticketUrl?: string;
  amountCents: number;
}

export function hasMercadoPago(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

export async function createPixCharge(params: {
  amountCents: number;
  description: string;
  payerEmail?: string;
  payerName?: string;
  externalReference?: string;
  notificationUrl?: string;
}): Promise<PixCharge> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurada");

  const [firstName, ...rest] = (params.payerName || "Cliente").trim().split(/\s+/);

  const res = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": params.externalReference || crypto.randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: Number((params.amountCents / 100).toFixed(2)),
      description: params.description,
      payment_method_id: "pix",
      external_reference: params.externalReference,
      notification_url: params.notificationUrl,
      payer: {
        email: params.payerEmail || "cliente@forneriapaulistana.com.br",
        first_name: firstName,
        last_name: rest.join(" ") || undefined,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Mercado Pago: ${JSON.stringify(data)}`);

  const tx = data.point_of_interaction?.transaction_data;
  return {
    id: String(data.id),
    qrCodeBase64: tx?.qr_code_base64,
    copiaECola: tx?.qr_code,
    ticketUrl: tx?.ticket_url,
    amountCents: Math.round(Number(data.transaction_amount) * 100),
  };
}

/** Consulta o status de um pagamento (approved | pending | rejected | ...). */
export async function getPaymentStatus(paymentId: string): Promise<string | null> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.status ?? null;
}
