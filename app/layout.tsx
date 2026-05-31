import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const OG_TITLE = "Bolão da Copa 2026 · Baterias Joinville";
const OG_DESCRICAO =
  "Palpita os 104 jogos da Copa, dispute com amigos e suba no ranking. 100% grátis.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Bolão Copa 2026 · Baterias Joinville",
  description:
    "Bolão gratuito da Copa do Mundo 2026. Palpita os 104 jogos e leva 1 Bateria Moura 60Ah de cortesia se for o melhor palpiteiro. Só pra Joinville e Pirabeiraba.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bolão Copa",
  },
  openGraph: {
    type: "website",
    siteName: "Bolão Copa 2026 · Baterias Joinville",
    title: OG_TITLE,
    description: OG_DESCRICAO,
    url: "/",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRICAO,
  },
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
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
