import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: `${store.brand} — Pizza paulistana em Jurerê | Peça on-line`,
  description:
    "Peça a autêntica pizza paulistana de forno a lenha em Jurerê, Florianópolis. Cardápio completo, meio a meio, entrega no bairro e pagamento por Pix.",
  openGraph: {
    title: `${store.brand} — Pizza em Jurerê`,
    description:
      "Pizza paulistana de forno a lenha com entrega em Jurerê. Peça on-line e pague por Pix.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
