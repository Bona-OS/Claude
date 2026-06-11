// Integração com a WhatsApp Cloud API (Meta).
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
const GRAPH = "https://graph.facebook.com/v21.0";

function cfg() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    throw new Error("WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID não configuradas");
  }
  return { token, phoneId };
}

export async function sendText(to: string, body: string): Promise<void> {
  const { token, phoneId } = cfg();
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  if (!res.ok) console.error("whatsapp sendText falhou", res.status, await res.text());
}

export async function sendImageByLink(to: string, link: string, caption?: string): Promise<void> {
  const { token, phoneId } = cfg();
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "image",
      image: { link, caption },
    }),
  });
  if (!res.ok) console.error("whatsapp sendImage falhou", res.status, await res.text());
}

/** Baixa uma mídia recebida (foto) a partir do media id. */
export async function downloadMedia(
  mediaId: string
): Promise<{ bytes: Buffer; mimeType: string }> {
  const { token } = cfg();
  const metaRes = await fetch(`${GRAPH}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meta = await metaRes.json();
  if (!meta?.url) throw new Error("Não consegui obter a URL da mídia do WhatsApp");
  const mediaRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${token}` } });
  const buf = Buffer.from(await mediaRes.arrayBuffer());
  return { bytes: buf, mimeType: meta.mime_type || "image/jpeg" };
}
