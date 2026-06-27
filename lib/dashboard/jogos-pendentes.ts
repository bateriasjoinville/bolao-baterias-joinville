import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { LOCK_WINDOW_MINUTES } from "@/lib/palpitar/lock";
import { type Database } from "@/lib/supabase/database.types";

const JANELA_HORAS = 48;

type MatchPendente = {
  id: number;
  kickoff_at: string;
  selecao_a_id: number | null;
  selecao_b_id: number | null;
};

// Conta jogos que a pessoa logada ainda pode E precisa palpitar:
// kickoff entre (agora + 1h) e (agora + 48h), com os dois times definidos,
// e sem palpite dela. Jogos a <1h já estão travados (não palpitáveis), então
// não contam — senão o lembrete cobraria algo impossível de palpitar.
export async function contarJogosPendentes48h(
  supabase: SupabaseClient<Database>,
  now: Date = new Date(),
): Promise<number> {
  const abreISO = new Date(
    now.getTime() + LOCK_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();
  const fimISO = new Date(
    now.getTime() + JANELA_HORAS * 60 * 60 * 1000,
  ).toISOString();

  const [matchesRes, predictionsRes] = await Promise.all([
    supabase
      .from("matches")
      .select("id, kickoff_at, selecao_a_id, selecao_b_id")
      .gt("kickoff_at", abreISO)
      .lt("kickoff_at", fimISO),
    supabase.from("predictions").select("match_id"),
  ]);

  const matches = (matchesRes.data ?? []) as MatchPendente[];
  const palpitados = new Set(
    (predictionsRes.data ?? []).map((p) => p.match_id),
  );

  return matches.filter(
    (m) =>
      m.selecao_a_id != null &&
      m.selecao_b_id != null &&
      !palpitados.has(m.id),
  ).length;
}
