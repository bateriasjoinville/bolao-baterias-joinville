import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { getRankingGeral, type RankingEntry } from "@/lib/ranking/queries";
import { type Database } from "@/lib/supabase/database.types";

import { getMembrosAprovados } from "./queries";
import { LIGA_TIPO, type LigaTipo } from "./types";

// Ranking interno da liga: reusa participant_scores (mesma fonte do
// ranking geral) filtrando pelos participantes aprovados.
// Pre-Copa todo mundo zerado, esperado.
// Liga oficial 'geral' = todo mundo: reusa getRankingGeral pra evitar um
// .in() com milhares de ids (estouraria o limite de URL do PostgREST).
export async function getRankingLiga(
  supabase: SupabaseClient<Database>,
  ligaId: string,
  tipo: LigaTipo | null = null,
): Promise<RankingEntry[]> {
  if (tipo === LIGA_TIPO.GERAL) {
    return getRankingGeral(supabase);
  }
  const ids = await getMembrosAprovados(supabase, ligaId);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("participant_scores")
    .select(
      "participant_id, display_name, pontos_total, placares_exatos, vencedores_acertados, diff_gols_total, palpites_validos",
    )
    .in("participant_id", ids)
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
