import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createAnonServerClient } from "@/lib/supabase/server";

// Kickoff do 1º jogo da Copa (match id = 1). Leitura pública (RLS
// matches_select_all). Retorna ISO pra contagem regressiva no client.
export async function getPrimeiroJogoKickoff(): Promise<string | null> {
  try {
    const supabase = createAnonServerClient();
    const { data, error } = await supabase
      .from("matches")
      .select("kickoff_at")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return data.kickoff_at;
  } catch {
    return null;
  }
}

// Total de inscritos. participants só é legível via service_role (RLS
// participants_select_own bloqueia anon). Prova social na landing.
export async function getTotalParticipantes(): Promise<number> {
  try {
    const admin = getSupabaseAdmin();
    const { count, error } = await admin
      .from("participants")
      .select("id", { count: "exact", head: true });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
