import Link from "next/link";
import CheckoutForm from "@/components/CheckoutForm";
import { hasMercadoPago } from "@/lib/mercadopago";
import { store } from "@/lib/store";

export const metadata = {
  title: `Finalizar pedido — ${store.brand}`,
};

export default function CheckoutPage() {
  // Definido no servidor: só habilita Pix se o Mercado Pago estiver configurado.
  const pixEnabled = hasMercadoPago();

  return (
    <main className="wrap page">
      <div className="page-head">
        <Link href="/" className="back">
          ← Voltar ao cardápio
        </Link>
        <h1>Finalizar pedido</h1>
      </div>
      <CheckoutForm pixEnabled={pixEnabled} />
    </main>
  );
}
