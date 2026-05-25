import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "@/lib/supabase/database.types";

type SelecaoTable = Database["public"]["Tables"]["selecoes"]["Row"];
type MatchTable = Database["public"]["Tables"]["matches"]["Row"];
type PredictionTable = Database["public"]["Tables"]["predictions"]["Row"];

export type SelecaoMin = Pick<SelecaoTable, "id" | "nome" | "codigo_iso">;

export type MatchRow = Pick<
  MatchTable,
  | "id"
  | "fase"
  | "grupo"
  | "kickoff_at"
  | "estadio"
  | "is_brasil"
  | "placar_a"
  | "placar_b"
  | "placeholder_a"
  | "placeholder_b"
> & {
  selecao_a: SelecaoMin | null;
  selecao_b: SelecaoMin | null;
};

export type PredictionMin = Pick<
  PredictionTable,
  "match_id" | "placar_a" | "placar_b"
>;

export type DashboardData = {
  nome: string;
  proximoBrasil: MatchRow | null;
  proximoGeral: MatchRow | null;
  proximos5: MatchRow[];
  predictions: PredictionMin[];
  totalMatches: number;
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
    totalMatchesRes,
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
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    nome: participantRes.data?.nome ?? "participante",
    proximoBrasil: (proximoBrasilRes.data as MatchRow | null) ?? null,
    proximoGeral: (proximoGeralRes.data as MatchRow | null) ?? null,
    proximos5: (proximos5Res.data as MatchRow[] | null) ?? [],
    predictions: (predictionsRes.data ?? []) as PredictionMin[],
    totalMatches: totalMatchesRes.count ?? 0,
  };
}

export {
  getMatchSide,
  findPrediction,
  type MatchSide,
} from "@/lib/dashboard/match-helpers";
