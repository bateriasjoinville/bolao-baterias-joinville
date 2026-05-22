// Baixa as 48 bandeiras das seleções da Copa 2026 de flagcdn.com pra public/flags/.
// Roda uma vez: `pnpm flags:download`. SVGs ficam commitados no repo
// (evita flagcdn como SPOF durante a Copa + sem hop extra pro usuário).
//
// Mantém alinhado com supabase/migrations/0002_seed.sql (códigos iso).
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const SELECOES = [
  { id: 1,  nome: "Brasil",             iso: "br" },
  { id: 2,  nome: "África do Sul",      iso: "za" },
  { id: 3,  nome: "Alemanha",           iso: "de" },
  { id: 4,  nome: "Arábia Saudita",     iso: "sa" },
  { id: 5,  nome: "Argélia",            iso: "dz" },
  { id: 6,  nome: "Argentina",          iso: "ar" },
  { id: 7,  nome: "Austrália",          iso: "au" },
  { id: 8,  nome: "Áustria",            iso: "at" },
  { id: 9,  nome: "Bélgica",            iso: "be" },
  { id: 10, nome: "Bósnia-Herzegovina", iso: "ba" },
  { id: 11, nome: "Cabo Verde",         iso: "cv" },
  { id: 12, nome: "Canadá",             iso: "ca" },
  { id: 13, nome: "Catar",              iso: "qa" },
  { id: 14, nome: "Colômbia",           iso: "co" },
  { id: 15, nome: "Coreia do Sul",      iso: "kr" },
  { id: 16, nome: "Costa do Marfim",    iso: "ci" },
  { id: 17, nome: "Croácia",            iso: "hr" },
  { id: 18, nome: "Curaçao",            iso: "cw" },
  { id: 19, nome: "Egito",              iso: "eg" },
  { id: 20, nome: "Equador",            iso: "ec" },
  { id: 21, nome: "Escócia",            iso: "gb-sct" },
  { id: 22, nome: "Espanha",            iso: "es" },
  { id: 23, nome: "Estados Unidos",     iso: "us" },
  { id: 24, nome: "França",             iso: "fr" },
  { id: 25, nome: "Gana",               iso: "gh" },
  { id: 26, nome: "Haiti",              iso: "ht" },
  { id: 27, nome: "Inglaterra",         iso: "gb-eng" },
  { id: 28, nome: "Irã",                iso: "ir" },
  { id: 29, nome: "Iraque",             iso: "iq" },
  { id: 30, nome: "Japão",              iso: "jp" },
  { id: 31, nome: "Jordânia",           iso: "jo" },
  { id: 32, nome: "Marrocos",           iso: "ma" },
  { id: 33, nome: "México",             iso: "mx" },
  { id: 34, nome: "Noruega",            iso: "no" },
  { id: 35, nome: "Nova Zelândia",      iso: "nz" },
  { id: 36, nome: "Países Baixos",      iso: "nl" },
  { id: 37, nome: "Panamá",             iso: "pa" },
  { id: 38, nome: "Paraguai",           iso: "py" },
  { id: 39, nome: "Portugal",           iso: "pt" },
  { id: 40, nome: "RD Congo",           iso: "cd" },
  { id: 41, nome: "Senegal",            iso: "sn" },
  { id: 42, nome: "Suécia",             iso: "se" },
  { id: 43, nome: "Suíça",              iso: "ch" },
  { id: 44, nome: "Tchéquia",           iso: "cz" },
  { id: 45, nome: "Tunísia",            iso: "tn" },
  { id: 46, nome: "Turquia",            iso: "tr" },
  { id: 47, nome: "Uruguai",            iso: "uy" },
  { id: 48, nome: "Uzbequistão",        iso: "uz" },
];

const DEST = "public/flags";
const BASE = "https://flagcdn.com";

await mkdir(DEST, { recursive: true });

const failures = [];
let ok = 0;

for (const { iso, nome } of SELECOES) {
  const url = `${BASE}/${iso}.svg`;
  try {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok || !contentType.includes("svg")) {
      failures.push({ iso, nome, status: res.status, contentType });
      console.error(
        `[fail] ${iso.padEnd(7)} ${nome} — status=${res.status} content-type=${contentType}`,
      );
      continue;
    }
    const svg = await res.text();
    await writeFile(join(DEST, `${iso}.svg`), svg);
    ok += 1;
    console.log(`[ok]   ${iso.padEnd(7)} ${nome}`);
  } catch (err) {
    failures.push({ iso, nome, error: err instanceof Error ? err.message : String(err) });
    console.error(`[fail] ${iso.padEnd(7)} ${nome} — ${err}`);
  }
}

console.log("");
console.log(`Sucesso: ${ok}/${SELECOES.length}`);

if (failures.length > 0) {
  console.error(`\n${failures.length} falha(s):`);
  for (const f of failures) {
    console.error(`  ${f.iso} (${f.nome}) — ${"status" in f ? `status=${f.status}` : f.error}`);
  }
  process.exit(1);
}

console.log(`\nBandeiras gravadas em ${DEST}/`);
