import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { calculatePoints } from "@/lib/scoring/calculate";
import { weekOfMatch } from "@/lib/scoring/weeks";
import { type Database } from "@/lib/supabase/database.types";

type Aggregated = {
  pontos: number;
  exatos: number;
  vencedores: number;
  diffTotal: number;
  validos: number;
};

function emptyAgg(): Aggregated {
  return {
    pontos: 0,
    exatos: 0,
    vencedores: 0,
    diffTotal: 0,
    validos: 0,
  };
}

export type RecalculateResult = {
  participantsUpdated: number;
  weeklyEntriesUpdated: number;
  finalizedMatches: number;
};

const DUMMY_UUID = "00000000-0000-0000-0000-000000000000";

export async function recalculateAllPoints(
  admin: SupabaseClient<Database>,
): Promise<RecalculateResult> {
  const { data: matchesData, error: matchesErr } = await admin
    .from("matches")
    .select("id, placar_a, placar_b, is_brasil, kickoff_at")
    .not("placar_a", "is", null)
    .not("placar_b", "is", null);
  if (matchesErr) throw matchesErr;

  const finishedById = new Map<number, NonNullable<typeof matchesData>[number]>();
  for (const m of matchesData ?? []) finishedById.set(m.id, m);

  const { data: predictionsData, error: predErr } = await admin
    .from("predictions")
    .select("participant_id, match_id, placar_a, placar_b");
  if (predErr) throw predErr;

  const totals = new Map<string, Aggregated>();
  const weekly = new Map<string, Aggregated>();

  for (const p of predictionsData ?? []) {
    const m = finishedById.get(p.match_id);
    if (!m || m.placar_a == null || m.placar_b == null) continue;

    const pts = calculatePoints(
      { a: p.placar_a, b: p.placar_b },
      { a: m.placar_a, b: m.placar_b },
      m.is_brasil,
    );

    const t = totals.get(p.participant_id) ?? emptyAgg();
    t.pontos += pts.pontos;
    if (pts.exato) t.exatos += 1;
    if (pts.vencedor) t.vencedores += 1;
    t.diffTotal += pts.diffGols;
    t.validos += 1;
    totals.set(p.participant_id, t);

    const semana = weekOfMatch(m.kickoff_at);
    if (semana != null) {
      const key = `${p.participant_id}|${semana}`;
      const w = weekly.get(key) ?? emptyAgg();
      w.pontos += pts.pontos;
      if (pts.exato) w.exatos += 1;
      if (pts.vencedor) w.vencedores += 1;
      w.diffTotal += pts.diffGols;
      w.validos += 1;
      weekly.set(key, w);
    }
  }

  const participantRows = Array.from(totals.entries()).map(([id, a]) => ({
    participant_id: id,
    pontos_total: a.pontos,
    placares_exatos: a.exatos,
    vencedores_acertados: a.vencedores,
    diff_gols_total: a.diffTotal,
    palpites_validos: a.validos,
  }));

  const weeklyRows = Array.from(weekly.entries()).map(([key, a]) => {
    const [id, sStr] = key.split("|");
    return {
      participant_id: id ?? "",
      semana: Number(sStr),
      pontos: a.pontos,
      placares_exatos: a.exatos,
      vencedores_acertados: a.vencedores,
      diff_gols_total: a.diffTotal,
      palpites_validos: a.validos,
    };
  });

  const { error: delTotalErr } = await admin
    .from("participant_scores")
    .delete()
    .neq("participant_id", DUMMY_UUID);
  if (delTotalErr) throw delTotalErr;

  if (participantRows.length > 0) {
    const { error } = await admin
      .from("participant_scores")
      .insert(participantRows);
    if (error) throw error;
  }

  const { error: delWeeklyErr } = await admin
    .from("weekly_scores")
    .delete()
    .neq("participant_id", DUMMY_UUID);
  if (delWeeklyErr) throw delWeeklyErr;

  if (weeklyRows.length > 0) {
    const { error } = await admin.from("weekly_scores").insert(weeklyRows);
    if (error) throw error;
  }

  return {
    participantsUpdated: participantRows.length,
    weeklyEntriesUpdated: weeklyRows.length,
    finalizedMatches: finishedById.size,
  };
}
