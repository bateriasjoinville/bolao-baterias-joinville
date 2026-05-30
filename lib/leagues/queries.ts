import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "@/lib/supabase/database.types";

import {
  MEMBRO_STATUS,
  type LigaBuscaResultado,
  type MembroStatus,
  type MeuPapel,
} from "./types";

export type { LigaBuscaResultado } from "./types";

type LeagueRow = Database["public"]["Tables"]["leagues"]["Row"];

export type LigaResumo = {
  id: string;
  nome: string;
  descricao: string | null;
  codigoConvite: string;
  ownerId: string;
  isPublica: boolean;
  meuPapel: MeuPapel;
};

export type LigaPorCodigo = {
  id: string;
  nome: string;
  descricao: string | null;
  ownerId: string;
  ownerNome: string;
  countAprovados: number;
  isPublica: boolean;
};

export type PendenteResumo = {
  participantId: string;
  nome: string;
  joinedAt: string;
};

export type MembroAprovado = {
  participantId: string;
  nome: string;
};

export type LigaStats = {
  countAprovados: number;
  countPendentes: number;
};

const LIGA_EMBED =
  "leagues:league_id(id, nome, descricao, codigo_convite, owner_id, is_publica)";

type MinhasLigasRaw = {
  status: string;
  leagues: Pick<
    LeagueRow,
    "id" | "nome" | "descricao" | "codigo_convite" | "owner_id" | "is_publica"
  > | null;
};

// Lista todas as ligas do participante: criadas (owner) + entrou em
// (aprovado ou pendente). Como o trigger adiciona o owner em league_members,
// uma única query em league_members cobre os 2 casos.
export async function getMinhasLigas(
  supabase: SupabaseClient<Database>,
  myId: string,
): Promise<LigaResumo[]> {
  const { data, error } = await supabase
    .from("league_members")
    .select(`status, ${LIGA_EMBED}`)
    .eq("participant_id", myId);
  if (error) throw error;
  const rows = (data ?? []) as MinhasLigasRaw[];
  return rows
    .filter((r) => r.leagues !== null)
    .map((r) => {
      const l = r.leagues!;
      const meuPapel: MeuPapel =
        l.owner_id === myId ? "owner" : (r.status as MembroStatus);
      return {
        id: l.id,
        nome: l.nome,
        descricao: l.descricao,
        codigoConvite: l.codigo_convite,
        ownerId: l.owner_id,
        isPublica: l.is_publica,
        meuPapel,
      };
    });
}

// Single league pelo id. RLS garante que só owner OU membro aprovado vê.
// Pendente recebe null aqui — quem chama deve checar getMeuStatusNaLiga.
export async function getLigaById(
  supabase: SupabaseClient<Database>,
  ligaId: string,
  myId: string,
): Promise<LigaResumo | null> {
  const { data, error } = await supabase
    .from("leagues")
    .select("id, nome, descricao, codigo_convite, owner_id, is_publica")
    .eq("id", ligaId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const meuPapel: MeuPapel =
    data.owner_id === myId ? "owner" : MEMBRO_STATUS.APROVADO;
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    codigoConvite: data.codigo_convite,
    ownerId: data.owner_id,
    isPublica: data.is_publica,
    meuPapel,
  };
}

// Lê o status do próprio participante numa liga (qualquer status).
// RLS de league_members_select_self permite ver o próprio row mesmo pendente.
export async function getMeuStatusNaLiga(
  supabase: SupabaseClient<Database>,
  ligaId: string,
  myId: string,
): Promise<MembroStatus | null> {
  const { data, error } = await supabase
    .from("league_members")
    .select("status")
    .eq("league_id", ligaId)
    .eq("participant_id", myId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return data.status as MembroStatus;
}

// Resolve liga pelo código de convite. USA service_role no caller: o landing
// /ligas/entrar/[codigo] precisa mostrar info pra usuário que ainda não é
// membro (RLS bloquearia). Caller chama com supabaseAdmin.
export async function getLigaPorCodigo(
  supabase: SupabaseClient<Database>,
  codigo: string,
): Promise<LigaPorCodigo | null> {
  const { data: liga, error: ligaErr } = await supabase
    .from("leagues")
    .select("id, nome, descricao, owner_id, is_publica")
    .eq("codigo_convite", codigo)
    .maybeSingle();
  if (ligaErr) throw ligaErr;
  if (!liga) return null;
  const [ownerRes, countRes] = await Promise.all([
    supabase
      .from("participants")
      .select("nome")
      .eq("id", liga.owner_id)
      .maybeSingle(),
    supabase
      .from("league_members")
      .select("league_id", { count: "exact", head: true })
      .eq("league_id", liga.id)
      .eq("status", MEMBRO_STATUS.APROVADO),
  ]);
  if (ownerRes.error) throw ownerRes.error;
  if (countRes.error) throw countRes.error;
  return {
    id: liga.id,
    nome: liga.nome,
    descricao: liga.descricao,
    ownerId: liga.owner_id,
    ownerNome: ownerRes.data?.nome ?? "",
    countAprovados: countRes.count ?? 0,
    isPublica: liga.is_publica,
  };
}

const PENDENTE_EMBED = "participants:participant_id(nome)";

type PendenteRaw = {
  participant_id: string;
  joined_at: string;
  participants: { nome: string } | null;
};

// Lista pendentes de aprovação numa liga. RLS de
// league_members_select_owner_of_league restringe ao owner.
export async function getPendentes(
  supabase: SupabaseClient<Database>,
  ligaId: string,
): Promise<PendenteResumo[]> {
  const { data, error } = await supabase
    .from("league_members")
    .select(`participant_id, joined_at, ${PENDENTE_EMBED}`)
    .eq("league_id", ligaId)
    .eq("status", MEMBRO_STATUS.PENDENTE)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as PendenteRaw[];
  return rows
    .filter((r) => r.participants !== null)
    .map((r) => ({
      participantId: r.participant_id,
      nome: r.participants!.nome,
      joinedAt: r.joined_at,
    }));
}

// IDs dos membros aprovados da liga. Base do ranking interno.
export async function getMembrosAprovados(
  supabase: SupabaseClient<Database>,
  ligaId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("league_members")
    .select("participant_id")
    .eq("league_id", ligaId)
    .eq("status", MEMBRO_STATUS.APROVADO);
  if (error) throw error;
  return (data ?? []).map((r) => r.participant_id);
}

const MEMBRO_NOME_EMBED = "participants:participant_id(nome)";

type MembroAprovadoRaw = {
  participant_id: string;
  participants: { nome: string } | null;
};

// Membros aprovados COM nome. Pra seção "Participantes" da página da liga.
// Inclui quem ainda não pontuou (ranking interno só mostra quem tem row em
// participant_scores).
export async function getMembrosAprovadosComNomes(
  supabase: SupabaseClient<Database>,
  ligaId: string,
): Promise<MembroAprovado[]> {
  const { data, error } = await supabase
    .from("league_members")
    .select(`participant_id, ${MEMBRO_NOME_EMBED}`)
    .eq("league_id", ligaId)
    .eq("status", MEMBRO_STATUS.APROVADO)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as MembroAprovadoRaw[];
  return rows
    .filter((r) => r.participants !== null)
    .map((r) => ({
      participantId: r.participant_id,
      nome: r.participants!.nome,
    }));
}

// Conta ligas onde o participante é owner. Pra limite de criação (10).
export async function countLigasComoOwner(
  supabase: SupabaseClient<Database>,
  myId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("leagues")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", myId);
  if (error) throw error;
  return count ?? 0;
}

// Conta TODAS as memberships do participante (pendente + aprovado, inclui
// as que ele é owner — trigger adiciona owner como member aprovado).
// Pra limite de participação (20). Q1b: simples, 1 query.
export async function countLigasComoMembro(
  supabase: SupabaseClient<Database>,
  myId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("league_members")
    .select("league_id", { count: "exact", head: true })
    .eq("participant_id", myId);
  if (error) throw error;
  return count ?? 0;
}

// Conta aprovados e pendentes de UMA liga. Pra detalhe da liga (badge).
export async function getLigaStats(
  supabase: SupabaseClient<Database>,
  ligaId: string,
): Promise<LigaStats> {
  const [aprovRes, pendRes] = await Promise.all([
    supabase
      .from("league_members")
      .select("league_id", { count: "exact", head: true })
      .eq("league_id", ligaId)
      .eq("status", MEMBRO_STATUS.APROVADO),
    supabase
      .from("league_members")
      .select("league_id", { count: "exact", head: true })
      .eq("league_id", ligaId)
      .eq("status", MEMBRO_STATUS.PENDENTE),
  ]);
  if (aprovRes.error) throw aprovRes.error;
  if (pendRes.error) throw pendRes.error;
  return {
    countAprovados: aprovRes.count ?? 0,
    countPendentes: pendRes.count ?? 0,
  };
}

// Stats agregadas de várias ligas em 1 query — pra /ligas e dashboard.
// PostgREST não tem GROUP BY; agregamos em JS. Volume esperado baixo
// (max 30 ligas × média ~10 membros = 300 rows).
export async function aggregateLigaStats(
  supabase: SupabaseClient<Database>,
  ligaIds: string[],
): Promise<Map<string, LigaStats>> {
  const map = new Map<string, LigaStats>();
  for (const id of ligaIds) {
    map.set(id, { countAprovados: 0, countPendentes: 0 });
  }
  if (ligaIds.length === 0) return map;
  const { data, error } = await supabase
    .from("league_members")
    .select("league_id, status")
    .in("league_id", ligaIds);
  if (error) throw error;
  for (const row of data ?? []) {
    const stats = map.get(row.league_id);
    if (!stats) continue;
    if (row.status === MEMBRO_STATUS.APROVADO) stats.countAprovados += 1;
    else if (row.status === MEMBRO_STATUS.PENDENTE) stats.countPendentes += 1;
  }
  return map;
}

// Busca ligas por nome (públicas E privadas). Projeção curada via service_role
// — NUNCA expõe codigo_convite. Mesmo motivo de getLigaPorCodigo usar admin:
// mostra info de liga pra quem ainda não é membro sem afrouxar a RLS.
// meuPapel indica se o participante já é owner/aprovado/pendente (ou null).
export async function buscarLigas(
  supabase: SupabaseClient<Database>,
  termo: string,
  myId: string,
): Promise<LigaBuscaResultado[]> {
  // Escapa curingas do ILIKE (default escape = backslash).
  const padrao = `%${termo.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  const { data: ligas, error } = await supabase
    .from("leagues")
    .select("id, nome, descricao, owner_id, is_publica")
    .ilike("nome", padrao)
    .order("nome", { ascending: true })
    .limit(30);
  if (error) throw error;
  const rows = ligas ?? [];
  if (rows.length === 0) return [];

  const ligaIds = rows.map((l) => l.id);
  const ownerIds = [...new Set(rows.map((l) => l.owner_id))];

  const [ownersRes, membersRes, statsMap] = await Promise.all([
    supabase.from("participants").select("id, nome").in("id", ownerIds),
    supabase
      .from("league_members")
      .select("league_id, status")
      .eq("participant_id", myId)
      .in("league_id", ligaIds),
    aggregateLigaStats(supabase, ligaIds),
  ]);
  if (ownersRes.error) throw ownersRes.error;
  if (membersRes.error) throw membersRes.error;

  const ownerNomeById = new Map(
    (ownersRes.data ?? []).map((o) => [o.id, o.nome]),
  );
  const meuStatusById = new Map(
    (membersRes.data ?? []).map(
      (m) => [m.league_id, m.status as MembroStatus] as const,
    ),
  );

  return rows.map((l) => {
    const meuPapel: MeuPapel | null =
      l.owner_id === myId ? "owner" : (meuStatusById.get(l.id) ?? null);
    return {
      id: l.id,
      nome: l.nome,
      descricao: l.descricao,
      isPublica: l.is_publica,
      ownerNome: ownerNomeById.get(l.owner_id) ?? "",
      countAprovados: statsMap.get(l.id)?.countAprovados ?? 0,
      meuPapel,
    };
  });
}
