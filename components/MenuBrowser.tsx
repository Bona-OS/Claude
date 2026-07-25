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
import Reveal from "./Reveal";

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

  const sections: { id: string; index: string; title: string; sub?: string; cards: React.ReactNode }[] = [
    {
      id: "pizzas-salgadas",
      index: "01",
      title: "Pizzas Salgadas",
      sub: "Monte meio a meio combinando dois sabores — cobramos o de maior valor.",
      cards: salgadas.map((p) => <PizzaCard key={p.id} pizza={p} flavors={salgadas} />),
    },
    {
      id: "pizzas-doces",
      index: "02",
      title: "Pizzas Doces",
      cards: doces.map((p) => <PizzaCard key={p.id} pizza={p} flavors={doces} />),
    },
    ...SIMPLE_SECTIONS.map(({ key, title }, i) => {
      const list = ITEMS.filter((it) => it.category === key);
      return {
        id: key,
        index: String(3 + i).padStart(2, "0"),
        title,
        cards: list.map((it) => <ItemCard key={it.id} item={it} />),
      };
    }).filter((s) => (s.cards as React.ReactNode[]).length > 0),
  ];

  return (
    <div className="menu">
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="menu-section">
          <Reveal className="menu-head">
            <p className="section-index">{s.index} — Cardápio</p>
            <h2 className="section-title">{s.title}</h2>
            {s.sub && <p className="section-sub">{s.sub}</p>}
          </Reveal>
          <div className="grid">{s.cards}</div>
        </section>
      ))}
    </div>
  );
}
