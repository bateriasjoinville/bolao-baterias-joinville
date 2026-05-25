import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { type MatchRow, type PredictionMin } from "@/lib/dashboard/queries";
import { type Database } from "@/lib/supabase/database.types";

export type PalpitarPageData = {
  nome: string;
  matches: MatchRow[];
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

export async function getPalpitarPageData(
  supabase: SupabaseClient<Database>,
): Promise<PalpitarPageData> {
  const [participantRes, matchesRes, predictionsRes] = await Promise.all([
    supabase.from("participants").select("nome").single(),
    supabase
      .from("matches")
      .select(MATCH_SELECT)
      .order("kickoff_at", { ascending: true }),
    supabase
      .from("predictions")
      .select("match_id, placar_a, placar_b"),
  ]);

  const matches = (matchesRes.data as MatchRow[] | null) ?? [];
  const predictions = (predictionsRes.data ?? []) as PredictionMin[];

  return {
    nome: participantRes.data?.nome ?? "participante",
    matches,
    predictions,
    totalMatches: matches.length,
  };
}
