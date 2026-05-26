// Atribui posições com empate compartilhado: (10pts, 10pts, 8pts) → (1º, 1º, 3º).
// Pressupõe que `rows` já vem ordenado pelos critérios completos (pontos desc,
// exatos desc, vencedores desc, diff asc).

import { type RankingEntry } from "@/lib/ranking/queries";

export type Ranked<T> = T & { posicao: number };

export function assignRanks<T>(
  rows: T[],
  keyFn: (row: T) => string,
): Ranked<T>[] {
  const result: Ranked<T>[] = [];
  let lastKey: string | null = null;
  let lastPosicao = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]!;
    const key = keyFn(row);
    const posicao = key === lastKey ? lastPosicao : i + 1;
    result.push({ ...row, posicao });
    lastKey = key;
    lastPosicao = posicao;
  }

  return result;
}

export function rankKey(e: RankingEntry): string {
  return `${e.pontos}|${e.placaresExatos}|${e.vencedoresAcertados}|${e.diffGolsTotal}`;
}
