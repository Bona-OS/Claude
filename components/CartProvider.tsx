"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildItemLine,
  buildPizzaLine,
  computeTotals,
  type CartLine,
  type CartTotals,
  type Fulfillment,
} from "@/lib/cart";
import type { SizeId } from "@/lib/menu";

const STORAGE_KEY = "forneria-cart-v1";

interface CartState {
  lines: CartLine[];
  fulfillment: Fulfillment;
  totals: CartTotals;
  addPizza: (pizzaId: string, size: SizeId, secondFlavor: string | undefined, qty: number) => void;
  addItem: (itemId: string, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setFulfillment: (f: Fulfillment) => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [hydrated, setHydrated] = useState(false);

  // Carrega do localStorage no primeiro render (cliente).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.lines)) setLines(parsed.lines);
        if (parsed.fulfillment) setFulfillment(parsed.fulfillment);
      }
    } catch {
      /* ignora estado corrompido */
    }
    setHydrated(true);
  }, []);

  // Persiste a cada mudança (após hidratar).
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, fulfillment }));
  }, [lines, fulfillment, hydrated]);

  const upsert = useCallback((line: CartLine) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.key === line.key);
      if (i === -1) return [...prev, line];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + line.qty };
      return next;
    });
  }, []);

  const addPizza = useCallback(
    (pizzaId: string, size: SizeId, secondFlavor: string | undefined, qty: number) => {
      const line = buildPizzaLine(pizzaId, size, secondFlavor, qty);
      if (line) upsert(line);
    },
    [upsert]
  );

  const addItem = useCallback(
    (itemId: string, qty: number) => {
      const line = buildItemLine(itemId, qty);
      if (line) upsert(line);
    },
    [upsert]
  );

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: Math.max(0, qty) } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(() => computeTotals(lines, fulfillment), [lines, fulfillment]);

  const value: CartState = {
    lines,
    fulfillment,
    totals,
    addPizza,
    addItem,
    setQty,
    remove,
    clear,
    setFulfillment,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
