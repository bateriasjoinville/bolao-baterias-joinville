import type { MatchRow, PredictionMin } from "@/lib/dashboard/queries";

export type MatchSide = {
  nome: string;
  bandeira: string;
  isDefined: boolean;
};

export function getMatchSide(match: MatchRow, side: "a" | "b"): MatchSide {
  const selecao = side === "a" ? match.selecao_a : match.selecao_b;
  if (selecao) {
    return {
      nome: selecao.nome,
      bandeira: `/flags/${selecao.codigo_iso}.svg`,
      isDefined: true,
    };
  }
  const placeholder =
    side === "a" ? match.placeholder_a : match.placeholder_b;
  return {
    nome: placeholder ?? "A definir",
    bandeira: "/flags/unknown.svg",
    isDefined: false,
  };
}

export function findPrediction(
  predictions: PredictionMin[],
  matchId: number,
): PredictionMin | undefined {
  return predictions.find((p) => p.match_id === matchId);
}
