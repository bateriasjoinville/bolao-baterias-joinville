import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { isMatchLocked } from "@/lib/palpitar/lock";
import { calculatePoints } from "@/lib/scoring/calculate";
import { collectPaged } from "@/lib/scoring/recalculate-core";
import { type Database } from "@/lib/supabase/database.types";

type Admin = SupabaseClient<Database>;

export type SelecaoLite = { nome: string; codigoIso: string };

export type MatchInfo = {
  id: number;
  fase: string;
  grupo: string | null;
  kickoffAt: string;
  estadio: string;
  isBrasil: boolean;
  selecaoA: SelecaoLite;
  selecaoB: SelecaoLite;
  placarA: number | null;
  placarB: number | null;
};

export type PalpiteDoJogo = {
  participantId: string;
  nome: string;
  placarA: number;
  placarB: number;
  pontos: number | null;
  exato: boolean;
};

export type PlacarContagem = {
  placarA: number;
  placarB: number;
  total: number;
};

export type PalpitesPorJogo =
  | { locked: false; match: MatchInfo }
  | {
      locked: true;
      match: MatchInfo;
      palpites: PalpiteDoJogo[];
      contagem: PlacarContagem[];
      total: number;
    };

export type ParticipanteInfo = {
  id: string;
  nome: string;
  cpf: string;
  whatsapp: string;
  instagram: string | null;
  cidade: string;
  estado: string;
  bairro: string | null;
};

export type PalpiteDoJogador = {
  match: MatchInfo;
  palpiteA: number;
  palpiteB: number;
  pontos: number | null;
  exato: boolean;
};

export type PalpitesPorJogador = {
  participante: ParticipanteInfo;
  palpites: PalpiteDoJogador[];
};

type RawSelecao = { nome: string; codigo_iso: string } | null;

type RawMatch = {
  id: number;
  fase: string;
  grupo: string | null;
  kickoff_at: string;
  estadio: string;
  is_brasil: boolean;
  placar_a: number | null;
  placar_b: number | null;
  selecao_a: RawSelecao;
  selecao_b: RawSelecao;
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
  selecao_a:selecao_a_id(nome, codigo_iso),
  selecao_b:selecao_b_id(nome, codigo_iso)
`;

function selecaoOf(raw: RawSelecao): SelecaoLite {
  return {
    nome: raw?.nome ?? "?",
    codigoIso: raw?.codigo_iso ?? "",
  };
}

function matchInfoOf(raw: RawMatch): MatchInfo {
  return {
    id: raw.id,
    fase: raw.fase,
    grupo: raw.grupo,
    kickoffAt: raw.kickoff_at,
    estadio: raw.estadio,
    isBrasil: raw.is_brasil,
    selecaoA: selecaoOf(raw.selecao_a),
    selecaoB: selecaoOf(raw.selecao_b),
    placarA: raw.placar_a,
    placarB: raw.placar_b,
  };
}

function pontosDe(
  match: MatchInfo,
  pa: number,
  pb: number,
): { pontos: number | null; exato: boolean } {
  if (match.placarA == null || match.placarB == null) {
    return { pontos: null, exato: false };
  }
  const b = calculatePoints(
    { a: pa, b: pb },
    { a: match.placarA, b: match.placarB },
    match.isBrasil,
  );
  return { pontos: b.pontos, exato: b.exato };
}

// Palpites de UM jogo. Só revela se o jogo já travou (≤1h do kickoff) — mesma
// proteção do RLS, reaplicada aqui porque o admin lê via service_role (sem RLS).
// Se não travou, nem chega a ler predictions.
export async function getPalpitesPorJogo(
  admin: Admin,
  matchId: number,
  nowISO: string,
): Promise<PalpitesPorJogo | null> {
  const { data: matchData, error: matchErr } = await admin
    .from("matches")
    .select(MATCH_SELECT)
    .eq("id", matchId)
    .maybeSingle();
  if (matchErr) throw matchErr;
  if (!matchData) return null;

  const match = matchInfoOf(matchData as unknown as RawMatch);
  const now = new Date(nowISO);

  if (!isMatchLocked(match.kickoffAt, now)) {
    return { locked: false, match };
  }

  type RawPred = {
    participant_id: string;
    placar_a: number;
    placar_b: number;
    participant: { nome: string } | null;
  };

  const rows = await collectPaged<RawPred>(async (offset, pageSize) => {
    const { data, error } = await admin
      .from("predictions")
      .select("participant_id, placar_a, placar_b, participant:participant_id(nome)")
      .eq("match_id", matchId)
      .order("participant_id", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    return (data ?? []) as unknown as RawPred[];
  });

  const palpites: PalpiteDoJogo[] = rows.map((r) => {
    const { pontos, exato } = pontosDe(match, r.placar_a, r.placar_b);
    return {
      participantId: r.participant_id,
      nome: r.participant?.nome ?? "Participante",
      placarA: r.placar_a,
      placarB: r.placar_b,
      pontos,
      exato,
    };
  });

  palpites.sort((a, b) => {
    const pa = a.pontos ?? -1;
    const pb = b.pontos ?? -1;
    if (pb !== pa) return pb - pa;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  const counts = new Map<string, PlacarContagem>();
  for (const p of palpites) {
    const key = `${p.placarA}-${p.placarB}`;
    const c = counts.get(key);
    if (c) c.total += 1;
    else counts.set(key, { placarA: p.placarA, placarB: p.placarB, total: 1 });
  }
  const contagem = Array.from(counts.values()).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (a.placarA !== b.placarA) return a.placarA - b.placarA;
    return a.placarB - b.placarB;
  });

  return { locked: true, match, palpites, contagem, total: palpites.length };
}

// Palpites de UM participante, só de jogos já travados. Mesma proteção de lock
// aplicada na borda (service_role ignora RLS).
export async function getPalpitesPorJogador(
  admin: Admin,
  participantId: string,
  nowISO: string,
): Promise<PalpitesPorJogador | null> {
  const { data: pData, error: pErr } = await admin
    .from("participants")
    .select("id, nome, cpf, whatsapp, instagram, cidade, estado, bairro")
    .eq("id", participantId)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!pData) return null;

  const participante: ParticipanteInfo = {
    id: pData.id,
    nome: pData.nome,
    cpf: pData.cpf,
    whatsapp: pData.whatsapp,
    instagram: pData.instagram,
    cidade: pData.cidade,
    estado: pData.estado,
    bairro: pData.bairro,
  };

  type RawPred = {
    placar_a: number;
    placar_b: number;
    match: RawMatch | null;
  };

  const rows = await collectPaged<RawPred>(async (offset, pageSize) => {
    const { data, error } = await admin
      .from("predictions")
      .select(`placar_a, placar_b, match:match_id(${MATCH_SELECT})`)
      .eq("participant_id", participantId)
      .order("match_id", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    return (data ?? []) as unknown as RawPred[];
  });

  const now = new Date(nowISO);
  const palpites: PalpiteDoJogador[] = [];
  for (const r of rows) {
    if (!r.match) continue;
    const match = matchInfoOf(r.match);
    if (!isMatchLocked(match.kickoffAt, now)) continue;
    const { pontos, exato } = pontosDe(match, r.placar_a, r.placar_b);
    palpites.push({
      match,
      palpiteA: r.placar_a,
      palpiteB: r.placar_b,
      pontos,
      exato,
    });
  }

  palpites.sort(
    (a, b) =>
      new Date(a.match.kickoffAt).getTime() -
      new Date(b.match.kickoffAt).getTime(),
  );

  return { participante, palpites };
}
