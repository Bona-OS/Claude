"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { formatBRL } from "@/lib/format";
import { store } from "@/lib/store";
import { useCart } from "./CartProvider";

export default function CheckoutForm({ pixEnabled }: { pixEnabled: boolean }) {
  const router = useRouter();
  const { lines, totals, fulfillment, clear } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "on_delivery">(
    pixEnabled ? "pix" : "on_delivery"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    neighborhood: store.deliveryZones[0],
    notes: "",
    changeFor: "",
  });

  if (totals.itemCount === 0) {
    return (
      <div className="empty">
        <p>Seu carrinho está vazio.</p>
        <Link className="btn btn-primary" href="/">
          Ver cardápio
        </Link>
      </div>
    );
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillment,
          paymentMethod,
          customer: form,
          items: lines.map((l) => ({
            kind: l.kind,
            refId: l.refId,
            qty: l.qty,
            size: l.meta?.size,
            secondFlavor: l.meta?.secondFlavor,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar o pedido.");
      clear();
      router.push(`/pedido/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="checkout" onSubmit={handleSubmit}>
      <div className="checkout-main">
        <fieldset>
          <legend>Seus dados</legend>
          <label className="field">
            <span>Nome *</span>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Seu nome"
            />
          </label>
          <label className="field">
            <span>WhatsApp / Telefone *</span>
            <input
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(48) 99999-0000"
              inputMode="tel"
            />
          </label>
          <label className="field">
            <span>E-mail (para o recibo do Pix)</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="voce@email.com"
            />
          </label>
        </fieldset>

        {fulfillment === "delivery" ? (
          <fieldset>
            <legend>Entrega</legend>
            <label className="field">
              <span>Endereço *</span>
              <input
                required
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Rua, número, complemento, referência"
              />
            </label>
            <label className="field">
              <span>Bairro</span>
              <select value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)}>
                {store.deliveryZones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
        ) : (
          <fieldset>
            <legend>Retirada</legend>
            <p className="muted">
              Retire em {store.address}. Fica pronto em ~{store.pickupEtaMin} min após a confirmação.
            </p>
          </fieldset>
        )}

        <fieldset>
          <legend>Pagamento</legend>
          <div className="pay-options">
            <label className={`pay-option ${paymentMethod === "pix" ? "sel" : ""} ${!pixEnabled ? "disabled" : ""}`}>
              <input
                type="radio"
                name="pay"
                value="pix"
                checked={paymentMethod === "pix"}
                disabled={!pixEnabled}
                onChange={() => setPaymentMethod("pix")}
              />
              <div>
                <strong>Pix (on-line)</strong>
                <small>{pixEnabled ? "Pague agora e agilize o preparo." : "Indisponível no momento."}</small>
              </div>
            </label>
            <label className={`pay-option ${paymentMethod === "on_delivery" ? "sel" : ""}`}>
              <input
                type="radio"
                name="pay"
                value="on_delivery"
                checked={paymentMethod === "on_delivery"}
                onChange={() => setPaymentMethod("on_delivery")}
              />
              <div>
                <strong>Pagar na {fulfillment === "delivery" ? "entrega" : "retirada"}</strong>
                <small>Dinheiro ou cartão na maquininha.</small>
              </div>
            </label>
          </div>

          {paymentMethod === "on_delivery" && fulfillment === "delivery" && (
            <label className="field">
              <span>Precisa de troco para quanto? (opcional)</span>
              <input
                value={form.changeFor}
                onChange={(e) => update("changeFor", e.target.value)}
                placeholder="Ex.: R$ 100"
                inputMode="numeric"
              />
            </label>
          )}
        </fieldset>

        <label className="field">
          <span>Observações do pedido</span>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Sem cebola, ponto da massa, etc."
            rows={2}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting
            ? "Enviando..."
            : paymentMethod === "pix"
              ? `Gerar Pix · ${formatBRL(totals.totalCents)}`
              : `Confirmar pedido · ${formatBRL(totals.totalCents)}`}
        </button>
      </div>

      <aside className="checkout-summary">
        <h3>Resumo</h3>
        <ul>
          {lines.map((l) => (
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
          <span>{formatBRL(totals.subtotalCents)}</span>
        </div>
        <div className="row">
          <span>{fulfillment === "delivery" ? "Entrega" : "Retirada"}</span>
          <span>{fulfillment === "delivery" ? formatBRL(totals.deliveryFeeCents) : "Grátis"}</span>
        </div>
        <div className="row total">
          <span>Total</span>
          <span>{formatBRL(totals.totalCents)}</span>
        </div>
        <p className="muted eta">
          Tempo estimado: ~{fulfillment === "delivery" ? store.deliveryEtaMin : store.pickupEtaMin} min
        </p>
      </aside>
    </form>
  );
}
