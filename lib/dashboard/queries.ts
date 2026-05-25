import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "@/lib/supabase/database.types";

export type SelecaoMin = {
  id: number;
  nome: string;
  codigo_iso: string;
};

export type MatchRow = {
  id: number;
  fase: string;
  grupo: string | null;
  kickoff_at: string;
  estadio: string;
  is_brasil: boolean;
  placar_a: number | null;
  placar_b: number | null;
  placeholder_a: string | null;
  placeholder_b: string | null;
  selecao_a: SelecaoMin | null;
  selecao_b: SelecaoMin | null;
};

export type PredictionMin = {
  match_id: number;
  placar_a: number;
  placar_b: number;
};

export type DashboardData = {
  nome: string;
  proximoBrasil: MatchRow | null;
  proximoGeral: MatchRow | null;
  proximos5: MatchRow[];
  predictions: PredictionMin[];
};

const MATCH_SELECT = `
  id,
  fase,
  grupo,
  kickoff_at,
  estadio,
  is_brasil,
  placar_a,
  placar_b,
  placeholder_a,
  placeholder_b,
  selecao_a:selecao_a_id(id, nome, codigo_iso),
  selecao_b:selecao_b_id(id, nome, codigo_iso)
`;

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
): Promise<DashboardData> {
  const nowIso = new Date().toISOString();

  const [
    participantRes,
    proximoBrasilRes,
    proximoGeralRes,
    proximos5Res,
    predictionsRes,
  ] = await Promise.all([
    supabase.from("participants").select("nome").single(),
    supabase
      .from("matches")
      .select(MATCH_SELECT)
      .eq("is_brasil", true)
      .gt("kickoff_at", nowIso)
      .order("kickoff_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("matches")
      .select(MATCH_SELECT)
      .gt("kickoff_at", nowIso)
      .order("kickoff_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("matches")
      .select(MATCH_SELECT)
      .gt("kickoff_at", nowIso)
      .order("kickoff_at", { ascending: true })
      .limit(5),
    supabase
      .from("predictions")
      .select("match_id, placar_a, placar_b"),
  ]);

  return {
    nome: participantRes.data?.nome ?? "participante",
    proximoBrasil: (proximoBrasilRes.data as MatchRow | null) ?? null,
    proximoGeral: (proximoGeralRes.data as MatchRow | null) ?? null,
    proximos5: (proximos5Res.data as MatchRow[] | null) ?? [],
    predictions: (predictionsRes.data ?? []) as PredictionMin[],
  };
}

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
