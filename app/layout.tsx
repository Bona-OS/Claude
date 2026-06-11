import type { Metadata } from "next";
import "./globals.css";

const brand = process.env.NEXT_PUBLIC_BRAND || "FotoRestaura";

export const metadata: Metadata = {
  title: `${brand} — Restauração de fotos antigas pelo WhatsApp`,
  description:
    "Mande sua foto antiga, rasgada ou desbotada pelo WhatsApp e receba ela restaurada em minutos. Sem app, sem cadastro.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
