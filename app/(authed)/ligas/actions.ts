"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { gerarCodigoConvite } from "@/lib/leagues/codigo";
import {
  buscarLigas,
  countLigasComoMembro,
  countLigasComoOwner,
  getMeuStatusNaLiga,
  type LigaBuscaResultado,
} from "@/lib/leagues/queries";
import {
  LIMITE_LIGAS_CRIADAS,
  LIMITE_LIGAS_PARTICIPANDO,
  MEMBRO_STATUS,
} from "@/lib/leagues/types";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  codigoConviteSchema,
  criarLigaInputSchema,
  termoBuscaSchema,
  uuidSchema,
} from "@/lib/validation/liga";

const MAX_TENTATIVAS_CODIGO = 3;

// ==================================================
// Result types
// ==================================================

export type ActionResult = { ok: true } | { ok: false; error: string };

export type CriarLigaState = {
  error?: string;
  fieldErrors?: { nome?: string; descricao?: string };
  values?: { nome: string; descricao: string; isPublica: boolean };
};

export type PedirEntradaState = {
  error?: string;
  codigo?: string;
};

export type BuscarLigasResult =
  | { ok: true; resultados: LigaBuscaResultado[] }
  | { ok: false; error: string };

// ==================================================
// Helpers
// ==================================================

type Admin = ReturnType<typeof getSupabaseAdmin>;

async function assertOwner(
  admin: Admin,
  ligaId: string,
  myId: string,
): Promise<ActionResult> {
  const { data, error } = await admin
    .from("leagues")
    .select("id")
    .eq("id", ligaId)
    .eq("owner_id", myId)
    .maybeSingle();
  if (error) return { ok: false, error: "Erro ao verificar a liga." };
  if (!data) return { ok: false, error: "Você não é organizador desta liga." };
  return { ok: true };
}

type EntrarResult =
  | { ok: true; ligaId: string }
  | { ok: false; error: string };

// Núcleo da entrada numa liga (por código OU por busca). Liga pública → vira
// membro aprovado direto; privada → cria pedido pendente (fluxo atual).
// Idempotente: owner ou já-membro retorna ok sem mexer em nada.
async function entrarEmLiga(
  admin: Admin,
  liga: { id: string; owner_id: string; is_publica: boolean },
  myId: string,
): Promise<EntrarResult> {
  if (liga.owner_id === myId) return { ok: true, ligaId: liga.id };

  const status = await getMeuStatusNaLiga(admin, liga.id, myId);
  if (status !== null) return { ok: true, ligaId: liga.id };

  const totalMembro = await countLigasComoMembro(admin, myId);
  if (totalMembro >= LIMITE_LIGAS_PARTICIPANDO) {
    return {
      ok: false,
      error: `Você já participa de ${LIMITE_LIGAS_PARTICIPANDO} ligas (limite).`,
    };
  }

  const novoStatus = liga.is_publica
    ? MEMBRO_STATUS.APROVADO
    : MEMBRO_STATUS.PENDENTE;

  const { error: insErr } = await admin.from("league_members").insert({
    league_id: liga.id,
    participant_id: myId,
    status: novoStatus,
  });
  if (insErr) {
    // Race: virou membro entre o check e o insert. Idempotente.
    if (insErr.code === "23505") return { ok: true, ligaId: liga.id };
    return { ok: false, error: "Erro ao entrar na liga. Tenta de novo." };
  }
  return { ok: true, ligaId: liga.id };
}

// ==================================================
// criarLiga (form action)
// ==================================================

export async function criarLiga(
  _prev: CriarLigaState,
  formData: FormData,
): Promise<CriarLigaState> {
  const session = await getSession();
  if (!session.participantId) redirect("/entrar");
  const myId = session.participantId;

  const rawNome = String(formData.get("nome") ?? "");
  const rawDescricao = String(formData.get("descricao") ?? "");
  const isPublica = formData.get("isPublica") === "on";
  const descricaoNorm =
    rawDescricao.trim().length > 0 ? rawDescricao.trim() : null;
  const values = { nome: rawNome, descricao: rawDescricao, isPublica };

  const parsed = criarLigaInputSchema.safeParse({
    nome: rawNome,
    descricao: descricaoNorm,
    isPublica,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues;
    return {
      fieldErrors: {
        nome: issues.find((i) => i.path[0] === "nome")?.message,
        descricao: issues.find((i) => i.path[0] === "descricao")?.message,
      },
      values,
    };
  }

  const admin = getSupabaseAdmin();

  const totalOwn = await countLigasComoOwner(admin, myId);
  if (totalOwn >= LIMITE_LIGAS_CRIADAS) {
    return {
      error: `Você já criou ${LIMITE_LIGAS_CRIADAS} ligas (limite).`,
      values,
    };
  }

  const totalMembro = await countLigasComoMembro(admin, myId);
  if (totalMembro >= LIMITE_LIGAS_PARTICIPANDO) {
    return {
      error: `Você já participa de ${LIMITE_LIGAS_PARTICIPANDO} ligas (limite, incluindo as criadas).`,
      values,
    };
  }

  let newId: string | null = null;
  for (let i = 0; i < MAX_TENTATIVAS_CODIGO; i += 1) {
    const codigo = gerarCodigoConvite();
    const { data, error } = await admin
      .from("leagues")
      .insert({
        nome: parsed.data.nome,
        descricao: parsed.data.descricao,
        codigo_convite: codigo,
        owner_id: myId,
        is_publica: parsed.data.isPublica,
      })
      .select("id")
      .single();
    if (!error && data) {
      newId = data.id;
      break;
    }
    if (error?.code !== "23505") {
      return {
        error: "Erro ao criar a liga. Tenta de novo em uns segundos.",
        values,
      };
    }
    // 23505 = unique_violation no codigo_convite → tenta de novo com novo código
  }

  if (!newId) {
    return {
      error: "Não foi possível gerar código único. Tenta de novo.",
      values,
    };
  }

  revalidatePath("/ligas");
  revalidatePath("/dashboard");
  redirect(`/ligas/${newId}`);
}

// ==================================================
// pedirEntradaPorCodigo (form action — usado pelo form manual e pela landing)
// ==================================================

export async function pedirEntradaPorCodigo(
  _prev: PedirEntradaState,
  formData: FormData,
): Promise<PedirEntradaState> {
  const session = await getSession();
  if (!session.participantId) redirect("/entrar");
  const myId = session.participantId;

  const rawCodigo = String(formData.get("codigo") ?? "");
  const parsed = codigoConviteSchema.safeParse(rawCodigo);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Código inválido.",
      codigo: rawCodigo,
    };
  }
  const codigo = parsed.data;

  const admin = getSupabaseAdmin();
  const { data: liga, error: ligaErr } = await admin
    .from("leagues")
    .select("id, owner_id, is_publica")
    .eq("codigo_convite", codigo)
    .maybeSingle();
  if (ligaErr) {
    return { error: "Erro ao verificar o código.", codigo: rawCodigo };
  }
  if (!liga) {
    return { error: "Liga não encontrada.", codigo: rawCodigo };
  }

  const result = await entrarEmLiga(admin, liga, myId);
  if (!result.ok) {
    return { error: result.error, codigo: rawCodigo };
  }

  revalidatePath("/ligas");
  revalidatePath("/dashboard");
  redirect(`/ligas/${result.ligaId}`);
}

// ==================================================
// Owner approval ops (button-click actions)
// ==================================================

export async function aprovarMembro(input: {
  ligaId: string;
  participantId: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session.participantId) return { ok: false, error: "Sessão expirada." };
  const myId = session.participantId;

  const ligaParsed = uuidSchema.safeParse(input.ligaId);
  const partParsed = uuidSchema.safeParse(input.participantId);
  if (!ligaParsed.success || !partParsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }

  const admin = getSupabaseAdmin();
  const owner = await assertOwner(admin, ligaParsed.data, myId);
  if (!owner.ok) return owner;

  // Só promove se ainda for pendente — evita corromper row aprovada.
  const { data, error } = await admin
    .from("league_members")
    .update({ status: MEMBRO_STATUS.APROVADO })
    .eq("league_id", ligaParsed.data)
    .eq("participant_id", partParsed.data)
    .eq("status", MEMBRO_STATUS.PENDENTE)
    .select("league_id")
    .maybeSingle();
  if (error) return { ok: false, error: "Erro ao aprovar." };
  if (!data) {
    return { ok: false, error: "Pedido não encontrado ou já tratado." };
  }

  revalidatePath(`/ligas/${ligaParsed.data}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function recusarMembro(input: {
  ligaId: string;
  participantId: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session.participantId) return { ok: false, error: "Sessão expirada." };
  const myId = session.participantId;

  const ligaParsed = uuidSchema.safeParse(input.ligaId);
  const partParsed = uuidSchema.safeParse(input.participantId);
  if (!ligaParsed.success || !partParsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }

  const admin = getSupabaseAdmin();
  const owner = await assertOwner(admin, ligaParsed.data, myId);
  if (!owner.ok) return owner;

  // Só deleta se ainda pendente — não usa essa action pra expulsar aprovado.
  const { error } = await admin
    .from("league_members")
    .delete()
    .eq("league_id", ligaParsed.data)
    .eq("participant_id", partParsed.data)
    .eq("status", MEMBRO_STATUS.PENDENTE);
  if (error) return { ok: false, error: "Erro ao recusar." };

  revalidatePath(`/ligas/${ligaParsed.data}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function removerMembro(input: {
  ligaId: string;
  participantId: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session.participantId) return { ok: false, error: "Sessão expirada." };
  const myId = session.participantId;

  const ligaParsed = uuidSchema.safeParse(input.ligaId);
  const partParsed = uuidSchema.safeParse(input.participantId);
  if (!ligaParsed.success || !partParsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }

  // Owner não se remove via essa action; use apagarLiga pra encerrar.
  if (partParsed.data === myId) {
    return {
      ok: false,
      error: "Você é o organizador — use 'Apagar liga' pra encerrar.",
    };
  }

  const admin = getSupabaseAdmin();
  const owner = await assertOwner(admin, ligaParsed.data, myId);
  if (!owner.ok) return owner;

  // Remove APENAS aprovado. Pra pendente, usa recusarMembro.
  const { error } = await admin
    .from("league_members")
    .delete()
    .eq("league_id", ligaParsed.data)
    .eq("participant_id", partParsed.data)
    .eq("status", MEMBRO_STATUS.APROVADO);
  if (error) return { ok: false, error: "Erro ao remover." };

  revalidatePath(`/ligas/${ligaParsed.data}`);
  return { ok: true };
}

// ==================================================
// Member exit + owner delete
// ==================================================

export async function sairDaLiga(input: {
  ligaId: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session.participantId) return { ok: false, error: "Sessão expirada." };
  const myId = session.participantId;

  const ligaParsed = uuidSchema.safeParse(input.ligaId);
  if (!ligaParsed.success) return { ok: false, error: "ID inválido." };

  const admin = getSupabaseAdmin();
  const { data: liga, error: ligaErr } = await admin
    .from("leagues")
    .select("owner_id")
    .eq("id", ligaParsed.data)
    .maybeSingle();
  if (ligaErr) return { ok: false, error: "Erro ao verificar a liga." };
  if (!liga) return { ok: false, error: "Liga não encontrada." };

  if (liga.owner_id === myId) {
    return {
      ok: false,
      error: "Você é o organizador. Use 'Apagar liga' pra encerrar.",
    };
  }

  const { error } = await admin
    .from("league_members")
    .delete()
    .eq("league_id", ligaParsed.data)
    .eq("participant_id", myId);
  if (error) return { ok: false, error: "Erro ao sair." };

  revalidatePath("/ligas");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function apagarLiga(input: {
  ligaId: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session.participantId) return { ok: false, error: "Sessão expirada." };
  const myId = session.participantId;

  const ligaParsed = uuidSchema.safeParse(input.ligaId);
  if (!ligaParsed.success) return { ok: false, error: "ID inválido." };

  const admin = getSupabaseAdmin();
  const owner = await assertOwner(admin, ligaParsed.data, myId);
  if (!owner.ok) return owner;

  // ON DELETE CASCADE em league_members cuida de limpar a membership.
  const { error } = await admin
    .from("leagues")
    .delete()
    .eq("id", ligaParsed.data);
  if (error) return { ok: false, error: "Erro ao apagar." };

  revalidatePath("/ligas");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ==================================================
// Busca + entrada por id (fluxo de busca por nome)
// ==================================================

export async function buscarLigasAction(
  termo: string,
): Promise<BuscarLigasResult> {
  const session = await getSession();
  if (!session.participantId) return { ok: false, error: "Sessão expirada." };
  const myId = session.participantId;

  const parsed = termoBuscaSchema.safeParse(termo);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Busca inválida.",
    };
  }

  const admin = getSupabaseAdmin();
  try {
    const resultados = await buscarLigas(admin, parsed.data, myId);
    return { ok: true, resultados };
  } catch {
    return { ok: false, error: "Erro ao buscar ligas. Tenta de novo." };
  }
}

export async function entrarNaLigaPorId(input: {
  ligaId: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session.participantId) return { ok: false, error: "Sessão expirada." };
  const myId = session.participantId;

  const ligaParsed = uuidSchema.safeParse(input.ligaId);
  if (!ligaParsed.success) return { ok: false, error: "ID inválido." };

  const admin = getSupabaseAdmin();
  const { data: liga, error: ligaErr } = await admin
    .from("leagues")
    .select("id, owner_id, is_publica")
    .eq("id", ligaParsed.data)
    .maybeSingle();
  if (ligaErr) return { ok: false, error: "Erro ao verificar a liga." };
  if (!liga) return { ok: false, error: "Liga não encontrada." };

  const result = await entrarEmLiga(admin, liga, myId);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/ligas");
  revalidatePath("/dashboard");
  redirect(`/ligas/${result.ligaId}`);
}

export async function definirLigaPublica(input: {
  ligaId: string;
  isPublica: boolean;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session.participantId) return { ok: false, error: "Sessão expirada." };
  const myId = session.participantId;

  const ligaParsed = uuidSchema.safeParse(input.ligaId);
  if (!ligaParsed.success) return { ok: false, error: "ID inválido." };
  if (typeof input.isPublica !== "boolean") {
    return { ok: false, error: "Valor inválido." };
  }

  const admin = getSupabaseAdmin();
  const owner = await assertOwner(admin, ligaParsed.data, myId);
  if (!owner.ok) return owner;

  const { error } = await admin
    .from("leagues")
    .update({ is_publica: input.isPublica })
    .eq("id", ligaParsed.data);
  if (error) return { ok: false, error: "Erro ao atualizar a liga." };

  revalidatePath(`/ligas/${ligaParsed.data}`);
  revalidatePath("/ligas");
  revalidatePath("/dashboard");
  return { ok: true };
}
