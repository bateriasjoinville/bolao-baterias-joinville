// URL canônica do site. Usada no metadataBase (og:image/twitter:image
// absolutas — WhatsApp/Facebook não resolvem caminho relativo).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolao.bateriasjoinville.com.br"
).replace(/\/$/, "");
