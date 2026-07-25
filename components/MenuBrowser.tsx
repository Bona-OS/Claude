"use client";

import { useState } from "react";
import {
  ITEMS,
  PIZZAS,
  SIZES,
  SWEET_PIZZAS,
  type Pizza,
  type SimpleCategory,
  type SimpleItem,
  type SizeId,
} from "@/lib/menu";
import { pizzaPriceCents } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { useCart } from "./CartProvider";

function PizzaCard({ pizza, flavors }: { pizza: Pizza; flavors: Pizza[] }) {
  const { addPizza } = useCart();
  const [size, setSize] = useState<SizeId>("grande");
  const [second, setSecond] = useState<string>("");
  const [added, setAdded] = useState(false);

  const price = pizzaPriceCents(pizza.id, size, second || undefined) ?? pizza.prices[size];

  function handleAdd() {
    addPizza(pizza.id, size, second || undefined, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="card">
      <div className="card-head">
        <h3>{pizza.name}</h3>
        <div className="tags">
          {pizza.tags?.map((t) => (
            <span key={t} className={`tag tag-${t}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <p className="desc">{pizza.description}</p>

      <div className="controls">
        <label className="field">
          <span>Tamanho</span>
          <select value={size} onChange={(e) => setSize(e.target.value as SizeId)}>
            {SIZES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} · {s.slices} fatias — {formatBRL(pizza.prices[s.id])}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Meio a meio (opcional)</span>
          <select value={second} onChange={(e) => setSecond(e.target.value)}>
            <option value="">Sabor único</option>
            {flavors
              .filter((f) => f.id !== pizza.id)
              .map((f) => (
                <option key={f.id} value={f.id}>
                  + {f.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="card-foot">
        <span className="price">{formatBRL(price)}</span>
        <button className="btn" onClick={handleAdd}>
          {added ? "✓ Adicionado" : "Adicionar"}
        </button>
      </div>
    </article>
  );
}

function ItemCard({ item }: { item: SimpleItem }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(item.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="card">
      <div className="card-head">
        <h3>{item.name}</h3>
      </div>
      {item.description && <p className="desc">{item.description}</p>}
      <div className="card-foot">
        <span className="price">{formatBRL(item.priceCents)}</span>
        <button className="btn" onClick={handleAdd}>
          {added ? "✓ Adicionado" : "Adicionar"}
        </button>
      </div>
    </article>
  );
}

const SIMPLE_SECTIONS: { key: SimpleCategory; title: string }[] = [
  { key: "entrada", title: "Entradas" },
  { key: "bebida", title: "Bebidas" },
  { key: "sobremesa", title: "Sobremesas" },
];

export default function MenuBrowser() {
  const salgadas = PIZZAS;
  const doces = SWEET_PIZZAS;

  return (
    <div className="menu">
      <section id="pizzas-salgadas" className="menu-section">
        <h2>Pizzas Salgadas</h2>
        <p className="section-sub">Monte meio a meio combinando dois sabores — cobramos o de maior valor.</p>
        <div className="grid">
          {salgadas.map((p) => (
            <PizzaCard key={p.id} pizza={p} flavors={salgadas} />
          ))}
        </div>
      </section>

      <section id="pizzas-doces" className="menu-section">
        <h2>Pizzas Doces</h2>
        <div className="grid">
          {doces.map((p) => (
            <PizzaCard key={p.id} pizza={p} flavors={doces} />
          ))}
        </div>
      </section>

      {SIMPLE_SECTIONS.map(({ key, title }) => {
        const list = ITEMS.filter((i) => i.category === key);
        if (list.length === 0) return null;
        return (
          <section key={key} id={key} className="menu-section">
            <h2>{title}</h2>
            <div className="grid">
              {list.map((i) => (
                <ItemCard key={i.id} item={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
