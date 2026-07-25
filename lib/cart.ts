// Tipos e cálculos do carrinho — puros, usados no cliente e revalidados no servidor.
import { findItem, findPizza, sizeLabel, type SizeId } from "./menu";
import { store } from "./store";

export interface CartLine {
  key: string; // identifica a linha (item + tamanho + 2º sabor)
  kind: "pizza" | "item";
  refId: string;
  name: string; // rótulo já pronto para exibir
  unitCents: number;
  qty: number;
  meta?: { size?: SizeId; secondFlavor?: string };
}

export type Fulfillment = "delivery" | "pickup";

/** Preço de uma pizza num tamanho; meio a meio usa o maior preço entre os dois sabores. */
export function pizzaPriceCents(
  pizzaId: string,
  size: SizeId,
  secondFlavorId?: string
): number | null {
  const a = findPizza(pizzaId);
  if (!a) return null;
  let price = a.prices[size];
  if (secondFlavorId && secondFlavorId !== pizzaId) {
    const b = findPizza(secondFlavorId);
    if (!b) return null;
    price = Math.max(price, b.prices[size]);
  }
  return price;
}

/** Monta uma linha de pizza (rótulo + preço). Retorna null se algo não existir. */
export function buildPizzaLine(
  pizzaId: string,
  size: SizeId,
  secondFlavorId: string | undefined,
  qty: number
): CartLine | null {
  const a = findPizza(pizzaId);
  if (!a) return null;
  const unit = pizzaPriceCents(pizzaId, size, secondFlavorId);
  if (unit == null) return null;

  let name = `${a.name} (${sizeLabel(size)})`;
  let key = `pizza:${pizzaId}:${size}`;
  if (secondFlavorId && secondFlavorId !== pizzaId) {
    const b = findPizza(secondFlavorId);
    if (!b) return null;
    name = `Meio a meio: ${a.name} / ${b.name} (${sizeLabel(size)})`;
    key = `pizza:${[pizzaId, secondFlavorId].sort().join("-")}:${size}`;
  }

  return { key, kind: "pizza", refId: pizzaId, name, unitCents: unit, qty, meta: { size, secondFlavor: secondFlavorId } };
}

/** Monta uma linha de item simples (bebida, entrada, sobremesa). */
export function buildItemLine(itemId: string, qty: number): CartLine | null {
  const it = findItem(itemId);
  if (!it) return null;
  return { key: `item:${itemId}`, kind: "item", refId: itemId, name: it.name, unitCents: it.priceCents, qty };
}

export interface CartTotals {
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  itemCount: number;
}

export function computeTotals(lines: CartLine[], fulfillment: Fulfillment): CartTotals {
  const subtotalCents = lines.reduce((sum, l) => sum + l.unitCents * l.qty, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const deliveryFeeCents =
    fulfillment === "delivery" && subtotalCents > 0 ? store.deliveryFeeCents : 0;
  return { subtotalCents, deliveryFeeCents, totalCents: subtotalCents + deliveryFeeCents, itemCount };
}
