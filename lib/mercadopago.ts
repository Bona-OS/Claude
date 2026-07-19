// Cobrança Pix via Mercado Pago.
// Docs: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
export interface PixCharge {
  id: string;
  qrCodeBase64?: string;
  copiaECola?: string;
  ticketUrl?: string;
  amount: number;
}

export async function createPixCharge(params: {
  amount: number;
  description: string;
  payerEmail?: string;
  externalReference?: string;
}): Promise<PixCharge> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurada");

  const res = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": params.externalReference || crypto.randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: params.amount,
      description: params.description,
      payment_method_id: "pix",
      external_reference: params.externalReference,
      payer: { email: params.payerEmail || "cliente@fotorestaura.com.br" },
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
    amount: data.transaction_amount,
  };
}
