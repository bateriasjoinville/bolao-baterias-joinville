import { calculatePoints } from "@/lib/scoring/calculate";
import { weekOfMatch } from "@/lib/scoring/weeks";

export type MatchLite = {
  id: number;
  placar_a: number | null;
  placar_b: number | null;
  is_brasil: boolean;
  kickoff_at: string;
};

export type PredictionLite = {
  participant_id: string;
  match_id: number;
  placar_a: number;
  placar_b: number;
};

export type ParticipantScoreRow = {
  participant_id: string;
  display_name: string;
  pontos_total: number;
  placares_exatos: number;
  vencedores_acertados: number;
  diff_gols_total: number;
  palpites_validos: number;
};

export type WeeklyScoreRow = {
  participant_id: string;
  display_name: string;
  semana: number;
  pontos: number;
  placares_exatos: number;
  vencedores_acertados: number;
  diff_gols_total: number;
  palpites_validos: number;
};

type Aggregated = {
  pontos: number;
  exatos: number;
  vencedores: number;
  diffTotal: number;
  validos: number;
};

function emptyAgg(): Aggregated {
  return { pontos: 0, exatos: 0, vencedores: 0, diffTotal: 0, validos: 0 };
}

export function weeklyKey(participantId: string, semana: number): string {
  return `${participantId}|${semana}`;
}

// Agregação pura de pontos. Idêntica à lógica anterior — só extraída pra ser
// testável sem banco. `displayNames` já vem formatado ("Primeiro I.").
export function computeScoreRows(
  matches: MatchLite[],
  predictions: PredictionLite[],
  displayNames: Map<string, string>,
): {
  participantRows: ParticipantScoreRow[];
  weeklyRows: WeeklyScoreRow[];
} {
  const finishedById = new Map<number, MatchLite>();
  for (const m of matches) {
    if (m.placar_a != null && m.placar_b != null) finishedById.set(m.id, m);
  }

  const totals = new Map<string, Aggregated>();
  const weekly = new Map<string, Aggregated>();

  for (const p of predictions) {
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
      const key = weeklyKey(p.participant_id, semana);
      const w = weekly.get(key) ?? emptyAgg();
      w.pontos += pts.pontos;
      if (pts.exato) w.exatos += 1;
      if (pts.vencedor) w.vencedores += 1;
      w.diffTotal += pts.diffGols;
      w.validos += 1;
      weekly.set(key, w);
    }
  }

  const nameOf = (id: string): string => displayNames.get(id) ?? "Participante";

  const participantRows: ParticipantScoreRow[] = Array.from(
    totals.entries(),
  ).map(([id, a]) => ({
    participant_id: id,
    display_name: nameOf(id),
    pontos_total: a.pontos,
    placares_exatos: a.exatos,
    vencedores_acertados: a.vencedores,
    diff_gols_total: a.diffTotal,
    palpites_validos: a.validos,
  }));

  const weeklyRows: WeeklyScoreRow[] = Array.from(weekly.entries()).map(
    ([key, a]) => {
      const [id, sStr] = key.split("|");
      const participantId = id ?? "";
      return {
        participant_id: participantId,
        display_name: nameOf(participantId),
        semana: Number(sStr),
        pontos: a.pontos,
        placares_exatos: a.exatos,
        vencedores_acertados: a.vencedores,
        diff_gols_total: a.diffTotal,
        palpites_validos: a.validos,
      };
    },
  );

  return { participantRows, weeklyRows };
}

export type WeeklyDeleteKey = { participant_id: string; semana: number };

// Decide o que REMOVER após o upsert: só as linhas que existiam antes e não
// fazem mais parte do conjunto novo (participante/semana que zerou os palpites
// válidos). Nunca devolve um "apagar tudo" — quem permanece é regravado por cima.
export function planPrune(
  existingTotalIds: string[],
  existingWeeklyKeys: string[],
  participantRows: ParticipantScoreRow[],
  weeklyRows: WeeklyScoreRow[],
): {
  totalDeleteIds: string[];
  weeklyDeleteKeys: WeeklyDeleteKey[];
} {
  const keepTotal = new Set(participantRows.map((r) => r.participant_id));
  const totalDeleteIds = existingTotalIds.filter((id) => !keepTotal.has(id));

  const keepWeekly = new Set(
    weeklyRows.map((r) => weeklyKey(r.participant_id, r.semana)),
  );
  const weeklyDeleteKeys: WeeklyDeleteKey[] = existingWeeklyKeys
    .filter((k) => !keepWeekly.has(k))
    .map((k) => {
      const [id, sStr] = k.split("|");
      return { participant_id: id ?? "", semana: Number(sStr) };
    });

  return { totalDeleteIds, weeklyDeleteKeys };
}
