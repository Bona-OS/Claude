"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatBRL } from "@/lib/format";
import { store, whatsappLink } from "@/lib/store";

interface OrderView {
  id: string;
  status: "pending_payment" | "paid" | "received" | "cancelled";
  fulfillment: "delivery" | "pickup";
  paymentMethod: "pix" | "on_delivery";
  items: { key: string; name: string; qty: number; unitCents: number }[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  pix: { copiaECola?: string; qrBase64?: string } | null;
  customer: { name: string };
  createdAt: string;
}

const STATUS_LABEL: Record<OrderView["status"], string> = {
  pending_payment: "Aguardando pagamento",
  paid: "Pagamento confirmado",
  received: "Pedido recebido",
  cancelled: "Cancelado",
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${params.id}`, { cache: "no-store" });
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    if (res.ok) setOrder(await res.json());
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Enquanto o Pix estiver pendente, refaz a consulta a cada 4s.
  useEffect(() => {
    if (order?.status === "pending_payment") {
      timer.current = setTimeout(load, 4000);
      return () => {
        if (timer.current) clearTimeout(timer.current);
      };
    }
  }, [order, load]);

  function copy() {
    if (order?.pix?.copiaECola) {
      navigator.clipboard.writeText(order.pix.copiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  if (notFound) {
    return (
      <main className="wrap page">
        <h1>Pedido não encontrado</h1>
        <p className="muted">Confira o link ou faça um novo pedido.</p>
        <Link className="btn btn-primary" href="/">
          Ver cardápio
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="wrap page">
        <p className="muted">Carregando pedido…</p>
      </main>
    );
  }

  const paid = order.status === "paid";
  const waitingPix = order.status === "pending_payment" && order.paymentMethod === "pix";
  const eta = order.fulfillment === "delivery" ? store.deliveryEtaMin : store.pickupEtaMin;

  return (
    <main className="wrap page order-page">
      <div className="page-head">
        <Link href="/" className="back">
          ← Voltar
        </Link>
        <h1>Pedido #{order.id.slice(0, 8)}</h1>
      </div>

      <div className={`status-banner ${paid || order.status === "received" ? "ok" : "wait"}`}>
        <strong>{STATUS_LABEL[order.status]}</strong>
        {paid && <span>Recebemos seu Pix! Já vamos começar a preparar. 🍕</span>}
        {order.status === "received" && (
          <span>
            Recebemos seu pedido. Pagamento na {order.fulfillment === "delivery" ? "entrega" : "retirada"}.
            Tempo estimado ~{eta} min.
          </span>
        )}
        {waitingPix && <span>Escaneie o QR Code ou copie o código abaixo para pagar.</span>}
      </div>

      {waitingPix && order.pix && (
        <section className="pix-box">
          <h2>Pague com Pix</h2>
          {order.pix.qrBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="pix-qr"
              src={`data:image/png;base64,${order.pix.qrBase64}`}
              alt="QR Code Pix"
              width={220}
              height={220}
            />
          ) : (
            <p className="muted">QR Code indisponível — use o código copia e cola.</p>
          )}
          {order.pix.copiaECola && (
            <>
              <textarea className="pix-code" readOnly value={order.pix.copiaECola} rows={3} />
              <button className="btn btn-primary" onClick={copy}>
                {copied ? "✓ Copiado!" : "Copiar código Pix"}
              </button>
            </>
          )}
          <p className="muted small">A confirmação é automática assim que o pagamento cair.</p>
        </section>
      )}

      <section className="order-items">
        <h2>Itens</h2>
        <ul>
          {order.items.map((l) => (
            <li key={l.key}>
              <span>
                {l.qty}× {l.name}
              </span>
              <span>{formatBRL(l.unitCents * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="row">
          <span>Subtotal</span>
          <span>{formatBRL(order.subtotalCents)}</span>
        </div>
        {order.fulfillment === "delivery" && (
          <div className="row">
            <span>Entrega</span>
            <span>{formatBRL(order.deliveryFeeCents)}</span>
          </div>
        )}
        <div className="row total">
          <span>Total</span>
          <span>{formatBRL(order.totalCents)}</span>
        </div>
      </section>

      <p className="muted">
        Dúvidas sobre o pedido?{" "}
        <a
          href={whatsappLink(`Olá! Sobre o pedido #${order.id.slice(0, 8)}...`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Fale no WhatsApp
        </a>
        .
      </p>
    </main>
  );
}
