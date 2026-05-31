import "server-only";

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FONT_DIR = path.join(ROOT, "lib/og/fonts");
const FLAG_DIR = path.join(ROOT, "public/flags");

// Pesos da Inter esperados em lib/og/fonts/. Enquanto não existirem, as rotas
// não passam `fonts` e o ImageResponse usa a fonte default (Geist) embutida no
// @vercel/og — visual quase idêntico. Basta dropar os 3 .ttf depois.
const INTER = [
  { file: "Inter-Regular.ttf", weight: 400 },
  { file: "Inter-Bold.ttf", weight: 700 },
  { file: "Inter-ExtraBold.ttf", weight: 800 },
] as const;

export type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700 | 800;
  style: "normal";
};

export function loadFonts(): OgFont[] | undefined {
  try {
    const out: OgFont[] = [];
    for (const f of INTER) {
      const p = path.join(FONT_DIR, f.file);
      if (!fs.existsSync(p)) return undefined;
      out.push({
        name: "Inter",
        data: fs.readFileSync(p),
        weight: f.weight,
        style: "normal",
      });
    }
    return out;
  } catch {
    return undefined;
  }
}

const ISO_RE = /^[a-z]{2}(-[a-z]{3})?$/;

// Lê o SVG da bandeira e embute como data URI (Satori não busca arquivo local).
// Fallback unknown.svg — nunca emoji (regra do CLAUDE.md).
export function flagDataUri(iso: string): string {
  const safe = ISO_RE.test(iso) ? iso : "unknown";
  const candidate = path.join(FLAG_DIR, `${safe}.svg`);
  const file = fs.existsSync(candidate)
    ? candidate
    : path.join(FLAG_DIR, "unknown.svg");
  const svg = fs.readFileSync(file).toString("base64");
  return `data:image/svg+xml;base64,${svg}`;
}
