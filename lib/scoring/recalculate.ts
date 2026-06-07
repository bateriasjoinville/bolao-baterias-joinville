import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import {
  computeScoreRows,
  planPrune,
  weeklyKey,
} from "@/lib/scoring/recalculate-core";
import { toDisplayName } from "@/lib/scoring/display-name";
import { type Database } from "@/lib/supabase/database.types";

export type RecalculateResult = {
  participantsUpdated: number;
  weeklyEntriesUpdated: number;
  finalizedMatches: number;
};

// Recalcula pontos SEM janela de ranking vazio: regrava por cima (upsert) e
// remove só quem deixou de pontuar. Nunca apaga as tabelas inteiras.
export async function recalculateAllPoints(
  admin: SupabaseClient<Database>,
): Promise<RecalculateResult> {
  const { data: matchesData, error: matchesErr } = await admin
    .from("matches")
    .select("id, placar_a, placar_b, is_brasil, kickoff_at")
    .not("placar_a", "is", null)
    .not("placar_b", "is", null);
  if (matchesErr) throw matchesErr;
  const matches = matchesData ?? [];

  const { data: predictionsData, error: predErr } = await admin
    .from("predictions")
    .select("participant_id, match_id, placar_a, placar_b");
  if (predErr) throw predErr;
  const predictions = predictionsData ?? [];

  const participantIds = Array.from(
    new Set(predictions.map((p) => p.participant_id)),
  );

  const displayNames = new Map<string, string>();
  if (participantIds.length > 0) {
    const { data: namesData, error: namesErr } = await admin
      .from("participants")
      .select("id, nome")
      .in("id", participantIds);
    if (namesErr) throw namesErr;
    for (const p of namesData ?? []) {
      displayNames.set(p.id, toDisplayName(p.nome));
    }
  }

  const { participantRows, weeklyRows } = computeScoreRows(
    matches,
    predictions,
    displayNames,
  );

  // Estado atual das tabelas de score, pra saber o que sobrou de fora do novo
  // conjunto (e só esses serão removidos).
  const { data: existingTotalData, error: exTotalErr } = await admin
    .from("participant_scores")
    .select("participant_id");
  if (exTotalErr) throw exTotalErr;
  const existingTotalIds = (existingTotalData ?? []).map(
    (r) => r.participant_id,
  );

  const { data: existingWeeklyData, error: exWeeklyErr } = await admin
    .from("weekly_scores")
    .select("participant_id, semana");
  if (exWeeklyErr) throw exWeeklyErr;
  const existingWeeklyKeys = (existingWeeklyData ?? []).map((r) =>
    weeklyKey(r.participant_id, r.semana),
  );

  const { totalDeleteIds, weeklyDeleteKeys } = planPrune(
    existingTotalIds,
    existingWeeklyKeys,
    participantRows,
    weeklyRows,
  );

  // 1) Regrava por cima (upsert atômico por linha). Quem está no ranking nunca
  // some durante essa etapa.
  if (participantRows.length > 0) {
    const { error } = await admin
      .from("participant_scores")
      .upsert(participantRows, { onConflict: "participant_id" });
    if (error) throw error;
  }

  if (weeklyRows.length > 0) {
    const { error } = await admin
      .from("weekly_scores")
      .upsert(weeklyRows, { onConflict: "participant_id,semana" });
    if (error) throw error;
  }

  // 2) Remove só os que deixaram de pontuar (ex.: placar foi limpo).
  if (totalDeleteIds.length > 0) {
    const { error } = await admin
      .from("participant_scores")
      .delete()
      .in("participant_id", totalDeleteIds);
    if (error) throw error;
  }

  for (const k of weeklyDeleteKeys) {
    const { error } = await admin
      .from("weekly_scores")
      .delete()
      .eq("participant_id", k.participant_id)
      .eq("semana", k.semana);
    if (error) throw error;
  }

  return {
    participantsUpdated: participantRows.length,
    weeklyEntriesUpdated: weeklyRows.length,
    finalizedMatches: matches.length,
  };
}
