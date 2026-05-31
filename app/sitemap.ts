import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Páginas públicas indexáveis. As privadas (atrás de login) ficam de fora
// e estão no Disallow do robots.
const PUBLICAS = ["/", "/cadastrar", "/regulamento", "/privacidade"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLICAS.map((rota) => ({
    url: `${SITE_URL}${rota === "/" ? "" : rota}`,
    changeFrequency: "weekly",
    priority: rota === "/" ? 1 : 0.6,
  }));
}
