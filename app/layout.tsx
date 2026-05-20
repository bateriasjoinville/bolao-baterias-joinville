import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bolão Copa 2026 · Baterias Joinville",
  description:
    "Bolão gratuito da Copa do Mundo 2026. Palpita os 104 jogos e concorre a mais de R$ 5.000 em prêmios. Só pra Joinville e Pirabeiraba.",
};

export const viewport: Viewport = {
  themeColor: "#2323e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
