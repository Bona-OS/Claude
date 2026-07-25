import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { store } from "@/lib/store";

// Tipografia editorial: serif expressiva para títulos, grotesca limpa para texto.
const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});
const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${store.brand} — Pizza paulistana de forno a lenha em Jurerê`,
  description:
    "A autêntica pizza paulistana de forno a lenha, agora em Jurerê, Florianópolis. Massa de fermentação natural. Peça on-line, monte meio a meio e pague por Pix.",
  openGraph: {
    title: `${store.brand} — Pizza em Jurerê`,
    description:
      "Pizza paulistana de forno a lenha com entrega em Jurerê. Peça on-line e pague por Pix.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body>
        <div className="grain" aria-hidden="true" />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
