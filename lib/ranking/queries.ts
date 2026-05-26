import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { type SemanaIndex } from "@/lib/scoring/weeks";
import { type Database } from "@/lib/supabase/database.types";

export type RankingEntry = {
  participantId: string;
  displayName: string;
  pontos: number;
  placaresExatos: number;
  vencedoresAcertados: number;
  diffGolsTotal: number;
  palpitesValidos: number;
};

// Traz o ranking inteiro pra calcular posição cliente-side via assignRanks.
// OK enquanto a base é pequena (estimativa MVP: <500 inscritos).
// Quando passar de ~500: virar RPC `rank_geral()` ou view materializada
// com posição pré-calculada (window function row_number/rank).
export async function getRankingGeral(
  supabase: SupabaseClient<Database>,
): Promise<RankingEntry[]> {
  const { data, error } = await supabase
    .from("participant_scores")
    .select(
      "participant_id, display_name, pontos_total, placares_exatos, vencedores_acertados, diff_gols_total, palpites_validos",
    )
    .order("pontos_total", { ascending: false })
    .order("placares_exatos", { ascending: false })
    .order("vencedores_acertados", { ascending: false })
    .order("diff_gols_total", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    participantId: row.participant_id,
    displayName: row.display_name,
    pontos: row.pontos_total,
    placaresExatos: row.placares_exatos,
    vencedoresAcertados: row.vencedores_acertados,
    diffGolsTotal: row.diff_gols_total,
    palpitesValidos: row.palpites_validos,
  }));
}

export async function getRankingSemana(
  supabase: SupabaseClient<Database>,
  semana: SemanaIndex,
): Promise<RankingEntry[]> {
  const { data, error } = await supabase
    .from("weekly_scores")
    .select(
      "participant_id, display_name, pontos, placares_exatos, vencedores_acertados, diff_gols_total, palpites_validos",
    )
    .eq("semana", semana)
    .order("pontos", { ascending: false })
    .order("placares_exatos", { ascending: false })
    .order("vencedores_acertados", { ascending: false })
    .order("diff_gols_total", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    participantId: row.participant_id,
    displayName: row.display_name,
    pontos: row.pontos,
    placaresExatos: row.placares_exatos,
    vencedoresAcertados: row.vencedores_acertados,
    diffGolsTotal: row.diff_gols_total,
    palpitesValidos: row.palpites_validos,
  }));
}
