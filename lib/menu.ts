// Cardápio da Forneria Paulistana. Preços sempre em CENTAVOS (inteiros).

export type SizeId = "media" | "grande" | "familia";

export interface SizeInfo {
  id: SizeId;
  label: string;
  slices: number;
}

export const SIZES: SizeInfo[] = [
  { id: "media", label: "Média", slices: 6 },
  { id: "grande", label: "Grande", slices: 8 },
  { id: "familia", label: "Família", slices: 12 },
];

export function sizeLabel(id: SizeId): string {
  return SIZES.find((s) => s.id === id)?.label ?? id;
}

export type PizzaCategory = "salgada" | "doce";

export interface Pizza {
  id: string;
  name: string;
  category: PizzaCategory;
  description: string;
  prices: Record<SizeId, number>;
  tags?: string[]; // ex.: "vegetariana", "picante"
}

export type SimpleCategory = "entrada" | "bebida" | "sobremesa";

export interface SimpleItem {
  id: string;
  name: string;
  category: SimpleCategory;
  description?: string;
  priceCents: number;
}

// --- Pizzas salgadas -------------------------------------------------------
export const PIZZAS: Pizza[] = [
  {
    id: "marguerita",
    name: "Marguerita",
    category: "salgada",
    description: "Molho de tomate italiano, mussarela, tomate, manjericão fresco e azeite.",
    prices: { media: 5490, grande: 6690, familia: 8490 },
    tags: ["vegetariana"],
  },
  {
    id: "mussarela",
    name: "Mussarela",
    category: "salgada",
    description: "A clássica: molho, mussarela em fartura, orégano e azeitonas.",
    prices: { media: 4990, grande: 5990, familia: 7690 },
    tags: ["vegetariana"],
  },
  {
    id: "calabresa",
    name: "Calabresa",
    category: "salgada",
    description: "Calabresa fatiada, cebola, mussarela e azeitonas.",
    prices: { media: 5290, grande: 6290, familia: 8090 },
  },
  {
    id: "portuguesa",
    name: "Portuguesa",
    category: "salgada",
    description: "Presunto, ovo, cebola, ervilha, mussarela e azeitonas.",
    prices: { media: 5690, grande: 6890, familia: 8790 },
  },
  {
    id: "frango-catupiry",
    name: "Frango com Catupiry",
    category: "salgada",
    description: "Frango desfiado temperado com Catupiry original e milho.",
    prices: { media: 5790, grande: 6990, familia: 8890 },
  },
  {
    id: "quatro-queijos",
    name: "Quatro Queijos",
    category: "salgada",
    description: "Mussarela, provolone, parmesão e gorgonzola.",
    prices: { media: 5990, grande: 7290, familia: 9190 },
    tags: ["vegetariana"],
  },
  {
    id: "pepperoni",
    name: "Pepperoni",
    category: "salgada",
    description: "Muito pepperoni sobre mussarela e molho de tomate.",
    prices: { media: 6190, grande: 7490, familia: 9490 },
    tags: ["picante"],
  },
  {
    id: "toscana",
    name: "Toscana",
    category: "salgada",
    description: "Linguiça toscana artesanal, cebola roxa, mussarela e orégano.",
    prices: { media: 5890, grande: 7090, familia: 8990 },
  },
  {
    id: "vegetariana",
    name: "Vegetariana",
    category: "salgada",
    description: "Abobrinha, berinjela, pimentão, tomate seco, rúcula e mussarela.",
    prices: { media: 5990, grande: 7190, familia: 9090 },
    tags: ["vegetariana"],
  },
  {
    id: "paulistana",
    name: "Paulistana (a da casa)",
    category: "salgada",
    description: "Mussarela, lombo canadense, catupiry, tomate seco e rúcula. A assinatura da casa.",
    prices: { media: 6490, grande: 7790, familia: 9790 },
  },
];

// --- Pizzas doces ----------------------------------------------------------
export const SWEET_PIZZAS: Pizza[] = [
  {
    id: "chocolate",
    name: "Chocolate ao Leite",
    category: "doce",
    description: "Chocolate ao leite derretido com granulado.",
    prices: { media: 5290, grande: 6390, familia: 8090 },
  },
  {
    id: "chocolate-morango",
    name: "Chocolate com Morango",
    category: "doce",
    description: "Chocolate ao leite com morangos frescos fatiados.",
    prices: { media: 5790, grande: 6990, familia: 8790 },
  },
  {
    id: "romeu-julieta",
    name: "Romeu e Julieta",
    category: "doce",
    description: "Mussarela com goiabada cremosa.",
    prices: { media: 5290, grande: 6390, familia: 8090 },
  },
];

export const ALL_PIZZAS: Pizza[] = [...PIZZAS, ...SWEET_PIZZAS];

export function findPizza(id: string): Pizza | undefined {
  return ALL_PIZZAS.find((p) => p.id === id);
}

// --- Entradas, bebidas e sobremesas ---------------------------------------
export const ITEMS: SimpleItem[] = [
  {
    id: "pao-alho",
    name: "Pão de Alho da Forneria",
    category: "entrada",
    description: "Assado no forno a lenha com alho e ervas (4 unidades).",
    priceCents: 2490,
  },
  {
    id: "bruschetta",
    name: "Bruschetta de Tomate",
    category: "entrada",
    description: "Pão italiano, tomate, manjericão e azeite (4 fatias).",
    priceCents: 2890,
  },
  {
    id: "polenta",
    name: "Polenta Frita",
    category: "entrada",
    description: "Porção crocante com parmesão.",
    priceCents: 2690,
  },

  { id: "refri-lata", name: "Refrigerante Lata 350ml", category: "bebida", priceCents: 790 },
  { id: "refri-2l", name: "Refrigerante 2L", category: "bebida", priceCents: 1490 },
  { id: "agua", name: "Água Mineral 500ml", category: "bebida", priceCents: 590 },
  { id: "suco", name: "Suco Natural 500ml", category: "bebida", description: "Laranja ou maracujá.", priceCents: 1290 },
  { id: "cerveja", name: "Cerveja Long Neck 355ml", category: "bebida", priceCents: 1190 },

  {
    id: "petit-gateau",
    name: "Petit Gâteau",
    category: "sobremesa",
    description: "Com sorvete de creme.",
    priceCents: 2690,
  },
  {
    id: "tiramisu",
    name: "Tiramisù",
    category: "sobremesa",
    description: "Clássico italiano da casa.",
    priceCents: 2490,
  },
];

export function findItem(id: string): SimpleItem | undefined {
  return ITEMS.find((i) => i.id === id);
}
