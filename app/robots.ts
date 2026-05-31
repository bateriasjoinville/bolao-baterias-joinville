import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Rotas privadas (atrás de login) — fora dos índices de busca.
const PRIVADAS = [
  "/admin",
  "/api",
  "/dashboard",
  "/palpitar",
  "/perfil",
  "/ligas",
  "/confirmar-whatsapp",
  "/esqueci-os-dados",
];

// Crawlers de preview de link: precisam de acesso TOTAL (inclusive às
// rotas /opengraph-image e /twitter-image) pra montar o card no
// WhatsApp/Facebook/Twitter/Telegram.
const CRAWLERS_PREVIEW = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "WhatsApp",
  "TelegramBot",
  "LinkedInBot",
  "Slackbot",
  "Discordbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVADAS,
      },
      {
        userAgent: CRAWLERS_PREVIEW,
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
