"use client";

import Link from "next/link";
import { useState } from "react";
import { formatBRL } from "@/lib/format";
import { store } from "@/lib/store";
import { useCart } from "./CartProvider";

export default function CartBar() {
  const { lines, totals, setQty, remove, fulfillment, setFulfillment } = useCart();
  const [open, setOpen] = useState(false);

  if (totals.itemCount === 0) return null;

  const belowMin = fulfillment === "delivery" && totals.subtotalCents < store.minOrderCents;

  return (
    <>
      <button className="cartbar" onClick={() => setOpen(true)} aria-label="Abrir carrinho">
        <span className="cartbar-count">{totals.itemCount}</span>
        <span>Ver carrinho</span>
        <strong>{formatBRL(totals.totalCents)}</strong>
      </button>

      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <header className="drawer-head">
              <h2>Seu pedido</h2>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Fechar">
                ✕
              </button>
            </header>

            <div className="toggle">
              <button
                className={fulfillment === "delivery" ? "on" : ""}
                onClick={() => setFulfillment("delivery")}
              >
                Entrega
              </button>
              <button
                className={fulfillment === "pickup" ? "on" : ""}
                onClick={() => setFulfillment("pickup")}
              >
                Retirada
              </button>
            </div>

            <ul className="lines">
              {lines.map((l) => (
                <li key={l.key}>
                  <div className="line-info">
                    <span className="line-name">{l.name}</span>
                    <span className="line-unit">{formatBRL(l.unitCents)}</span>
                  </div>
                  <div className="qty">
                    <button onClick={() => setQty(l.key, l.qty - 1)} aria-label="Menos">
                      −
                    </button>
                    <span>{l.qty}</span>
                    <button onClick={() => setQty(l.key, l.qty + 1)} aria-label="Mais">
                      +
                    </button>
                    <button className="rm" onClick={() => remove(l.key)} aria-label="Remover">
                      🗑
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="summary">
              <div className="row">
                <span>Subtotal</span>
                <span>{formatBRL(totals.subtotalCents)}</span>
              </div>
              <div className="row">
                <span>{fulfillment === "delivery" ? "Taxa de entrega" : "Retirada no balcão"}</span>
                <span>{fulfillment === "delivery" ? formatBRL(totals.deliveryFeeCents) : "Grátis"}</span>
              </div>
              <div className="row total">
                <span>Total</span>
                <span>{formatBRL(totals.totalCents)}</span>
              </div>
            </div>

            {belowMin ? (
              <p className="warn">
                Pedido mínimo para entrega: {formatBRL(store.minOrderCents)}. Adicione mais itens ou
                escolha retirada.
              </p>
            ) : (
              <Link className="btn btn-primary btn-block" href="/checkout" onClick={() => setOpen(false)}>
                Finalizar pedido
              </Link>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
