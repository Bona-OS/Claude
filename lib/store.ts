// Configuração da loja. Ajuste aqui os dados reais da Forneria Paulistana.
export const store = {
  brand: process.env.NEXT_PUBLIC_BRAND || "Forneria Paulistana",
  tagline: "Pizza paulistana de forno a lenha, agora em Jurerê.",
  city: "Florianópolis / SC",
  neighborhood: "Jurerê",
  address: "Servidão da Forneria, 123 — Jurerê, Florianópolis/SC",
  hours: "Terça a domingo, das 18h à 23h30",
  instagram: "@forneriapaulistana",
  // Número só com dígitos, formato internacional (para o link wa.me).
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5548999990000",

  // Regras de entrega (valores em centavos).
  deliveryFeeCents: 900,
  minOrderCents: 5000,
  deliveryEtaMin: 45,
  pickupEtaMin: 25,

  // Bairros atendidos para entrega.
  deliveryZones: [
    "Jurerê",
    "Jurerê Internacional",
    "Praia do Forte",
    "Daniela",
    "Canasvieiras",
  ],
};

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${store.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
