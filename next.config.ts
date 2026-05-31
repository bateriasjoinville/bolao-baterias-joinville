import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que fontes do OG e bandeiras SVG entrem no bundle das rotas /share
  // (lidas via fs em runtime — sem isso a Vercel não as inclui no deploy).
  outputFileTracingIncludes: {
    "/share/palpite": ["./public/flags/**", "./lib/og/fonts/**"],
    "/share/cravou": ["./public/flags/**", "./lib/og/fonts/**"],
    "/share/ranking": ["./lib/og/fonts/**"],
  },
};

export default nextConfig;
