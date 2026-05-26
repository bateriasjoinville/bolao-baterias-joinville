import { type PointsBreakdown } from "@/lib/scoring/types";

export const PONTOS_EXATO = 6;
export const PONTOS_VENCEDOR = 3;
export const MULTIPLICADOR_BRASIL = 2;

type Placar = { a: number; b: number };

function vencedor({ a, b }: Placar): "A" | "B" | "E" {
  if (a > b) return "A";
  if (b > a) return "B";
  return "E";
}

export function calculatePoints(
  palpite: Placar,
  real: Placar,
  isBrasil: boolean,
): PointsBreakdown {
  const mult = isBrasil ? MULTIPLICADOR_BRASIL : 1;
  const exato = palpite.a === real.a && palpite.b === real.b;
  const acertouVencedor = vencedor(palpite) === vencedor(real);
  const diffGols = Math.abs(palpite.a - real.a) + Math.abs(palpite.b - real.b);

  if (exato) {
    return {
      pontos: PONTOS_EXATO * mult,
      exato: true,
      vencedor: true,
      diffGols: 0,
    };
  }
  if (acertouVencedor) {
    return {
      pontos: PONTOS_VENCEDOR * mult,
      exato: false,
      vencedor: true,
      diffGols,
    };
  }
  return {
    pontos: 0,
    exato: false,
    vencedor: false,
    diffGols,
  };
}
