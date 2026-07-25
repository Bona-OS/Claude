/** Formata um valor em centavos como moeda brasileira (ex.: 5990 -> "R$ 59,90"). */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
