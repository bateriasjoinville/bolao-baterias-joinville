"use server";

import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { palpiteInputSchema } from "@/lib/validation/palpite";
import { type PalpiteSaveResult } from "@/lib/palpitar/types";

const LOCK_WINDOW_MS = 60 * 60 * 1000;

export async function salvarPalpite(input: {
  matchId: number;
  placarA: number;
  placarB: number;
}): Promise<PalpiteSaveResult> {
  const session = await getSession();
  const participantId = session.participantId;
  if (!participantId) {
    return { ok: false, error: "Sessão expirada. Faça login de novo." };
  }

  const parsed = palpiteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Placar inválido." };
  }
  const { matchId, placarA, placarB } = parsed.data;

  const admin = getSupabaseAdmin();

  const { data: match, error: matchErr } = await admin
    .from("matches")
    .select("id, kickoff_at, selecao_a_id, selecao_b_id")
    .eq("id", matchId)
    .maybeSingle();

  if (matchErr) {
    return { ok: false, error: "Erro ao verificar o jogo." };
  }
  if (!match) {
    return { ok: false, error: "Jogo não encontrado." };
  }
  if (match.selecao_a_id == null || match.selecao_b_id == null) {
    return { ok: false, error: "Confronto ainda não definido." };
  }

  const kickoffMs = new Date(match.kickoff_at).getTime();
  if (kickoffMs - Date.now() <= LOCK_WINDOW_MS) {
    return { ok: false, error: "Palpite travado · jogo começa em menos de 1h." };
  }

  const { error: upsertErr } = await admin.from("predictions").upsert(
    {
      match_id: matchId,
      participant_id: participantId,
      placar_a: placarA,
      placar_b: placarB,
    },
    { onConflict: "match_id,participant_id" },
  );

  if (upsertErr) {
    return { ok: false, error: "Não foi possível salvar agora." };
  }

  return { ok: true };
}
