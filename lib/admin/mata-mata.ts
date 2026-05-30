import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { descreverPlaceholder, parsePlaceholder } from "@/lib/admin/placeholder";
import {
  type ConfrontoPendente,
  type ConfrontosData,
  type LadoConfronto,
  type SelecaoOption,
} from "@/lib/admin/mata-mata-types";
import { type Database } from "@/lib/supabase/database.types";

export type {
  ConfrontoPendente,
  ConfrontosData,
  LadoConfronto,
  SelecaoOption,
} from "@/lib/admin/mata-mata-types";

type MatchMin = {
  id: number;
  fase: string;
  grupo: string | null;
  kickoff_at: string;
  estadio: string;
  is_brasil: boolean;
  selecao_a_id: number | null;
  selecao_b_id: number | null;
  placeholder_a: string | null;
  placeholder_b: string | null;
};

const MATCH_SELECT =
  "id, fase, grupo, kickoff_at, estadio, is_brasil, selecao_a_id, selecao_b_id, placeholder_a, placeholder_b";

function isPendente(m: MatchMin): boolean {
  return (
    m.fase !== "grupos" &&
    (m.selecao_a_id == null || m.selecao_b_id == null)
  );
}

// Resolve os candidatos de um placeholder, dado o mapa de grupos→times e os jogos.
function resolverCandidatos(
  token: string,
  gruposToIds: Map<string, Set<number>>,
  matchById: Map<number, MatchMin>,
  selById: Map<number, SelecaoOption>,
): SelecaoOption[] {
  const info = parsePlaceholder(token);
  const ids = new Set<number>();

  if (info.tipo === "grupo") {
    for (const id of gruposToIds.get(info.grupo) ?? []) ids.add(id);
  } else if (info.tipo === "melhor3") {
    for (const g of info.grupos) {
      for (const id of gruposToIds.get(g) ?? []) ids.add(id);
    }
  } else if (info.tipo === "origemJogo") {
    const origem = matchById.get(info.jogoId);
    if (origem?.selecao_a_id != null) ids.add(origem.selecao_a_id);
    if (origem?.selecao_b_id != null) ids.add(origem.selecao_b_id);
  }

  const out: SelecaoOption[] = [];
  for (const id of ids) {
    const s = selById.get(id);
    if (s) out.push(s);
  }
  out.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return out;
}

// Descrição com nomes dos times do jogo de origem quando já resolvido.
function descricaoLado(
  token: string,
  matchById: Map<number, MatchMin>,
  selById: Map<number, SelecaoOption>,
): string {
  const info = parsePlaceholder(token);
  const base = descreverPlaceholder(token);
  if (info.tipo !== "origemJogo") return base;

  const origem = matchById.get(info.jogoId);
  if (origem?.selecao_a_id != null && origem.selecao_b_id != null) {
    const a = selById.get(origem.selecao_a_id)?.nome ?? "?";
    const b = selById.get(origem.selecao_b_id)?.nome ?? "?";
    return `${base} (${a} × ${b})`;
  }
  return `${base} (jogo ${info.jogoId} ainda não definido)`;
}

function buildLado(
  selecaoId: number | null,
  placeholder: string | null,
  gruposToIds: Map<string, Set<number>>,
  matchById: Map<number, MatchMin>,
  selById: Map<number, SelecaoOption>,
): LadoConfronto {
  if (selecaoId != null) {
    return {
      selecao: selById.get(selecaoId) ?? null,
      placeholder: null,
      descricao: "",
      candidatos: [],
    };
  }
  const token = placeholder ?? "";
  return {
    selecao: null,
    placeholder: token,
    descricao: token ? descricaoLado(token, matchById, selById) : "A definir",
    candidatos: token
      ? resolverCandidatos(token, gruposToIds, matchById, selById)
      : [],
  };
}

export async function getConfrontosPendentes(
  supabase: SupabaseClient<Database>,
): Promise<ConfrontosData> {
  const [selecoesRes, matchesRes] = await Promise.all([
    supabase.from("selecoes").select("id, nome, codigo_iso").order("nome"),
    supabase.from("matches").select(MATCH_SELECT).order("kickoff_at"),
  ]);
  if (selecoesRes.error) throw selecoesRes.error;
  if (matchesRes.error) throw matchesRes.error;

  const selecoes: SelecaoOption[] = (selecoesRes.data ?? []).map((s) => ({
    id: s.id,
    nome: s.nome,
    codigoIso: s.codigo_iso,
  }));
  const selById = new Map(selecoes.map((s) => [s.id, s]));

  const matches = (matchesRes.data ?? []) as unknown as MatchMin[];
  const matchById = new Map(matches.map((m) => [m.id, m]));

  // grupo → ids dos times (derivado dos jogos de grupo, que já têm seleção real)
  const gruposToIds = new Map<string, Set<number>>();
  for (const m of matches) {
    if (m.fase !== "grupos" || !m.grupo) continue;
    const set = gruposToIds.get(m.grupo) ?? new Set<number>();
    if (m.selecao_a_id != null) set.add(m.selecao_a_id);
    if (m.selecao_b_id != null) set.add(m.selecao_b_id);
    gruposToIds.set(m.grupo, set);
  }

  const confrontos: ConfrontoPendente[] = matches
    .filter(isPendente)
    .map((m) => ({
      id: m.id,
      fase: m.fase,
      kickoffAt: m.kickoff_at,
      estadio: m.estadio,
      isBrasil: m.is_brasil,
      ladoA: buildLado(
        m.selecao_a_id,
        m.placeholder_a,
        gruposToIds,
        matchById,
        selById,
      ),
      ladoB: buildLado(
        m.selecao_b_id,
        m.placeholder_b,
        gruposToIds,
        matchById,
        selById,
      ),
    }));

  return { confrontos, selecoes };
}

export async function countConfrontosPendentes(
  supabase: SupabaseClient<Database>,
): Promise<number> {
  const { data, error } = await supabase
    .from("matches")
    .select("id, fase, selecao_a_id, selecao_b_id");
  if (error) throw error;
  return (data ?? []).filter(
    (m) =>
      m.fase !== "grupos" &&
      (m.selecao_a_id == null || m.selecao_b_id == null),
  ).length;
}
