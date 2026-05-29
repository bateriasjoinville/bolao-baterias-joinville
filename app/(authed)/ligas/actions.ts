"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { gerarCodigoConvite } from "@/lib/leagues/codigo";
import {
  countLigasComoMembro,
  countLigasComoOwner,
  getMeuStatusNaLiga,
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
  values?: { nome: string; descricao: string };
};

export type PedirEntradaState = {
  error?: string;
  codigo?: string;
};

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
  const descricaoNorm =
    rawDescricao.trim().length > 0 ? rawDescricao.trim() : null;

  const parsed = criarLigaInputSchema.safeParse({
    nome: rawNome,
    descricao: descricaoNorm,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues;
    return {
      fieldErrors: {
        nome: issues.find((i) => i.path[0] === "nome")?.message,
        descricao: issues.find((i) => i.path[0] === "descricao")?.message,
      },
      values: { nome: rawNome, descricao: rawDescricao },
    };
  }

  const admin = getSupabaseAdmin();

  const totalOwn = await countLigasComoOwner(admin, myId);
  if (totalOwn >= LIMITE_LIGAS_CRIADAS) {
    return {
      error: `Você já criou ${LIMITE_LIGAS_CRIADAS} ligas (limite).`,
      values: { nome: rawNome, descricao: rawDescricao },
    };
  }

  const totalMembro = await countLigasComoMembro(admin, myId);
  if (totalMembro >= LIMITE_LIGAS_PARTICIPANDO) {
    return {
      error: `Você já participa de ${LIMITE_LIGAS_PARTICIPANDO} ligas (limite, incluindo as criadas).`,
      values: { nome: rawNome, descricao: rawDescricao },
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
        values: { nome: rawNome, descricao: rawDescricao },
      };
    }
    // 23505 = unique_violation no codigo_convite → tenta de novo com novo código
  }

  if (!newId) {
    return {
      error: "Não foi possível gerar código único. Tenta de novo.",
      values: { nome: rawNome, descricao: rawDescricao },
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
    .select("id, owner_id")
    .eq("codigo_convite", codigo)
    .maybeSingle();
  if (ligaErr) {
    return { error: "Erro ao verificar o código.", codigo: rawCodigo };
  }
  if (!liga) {
    return { error: "Liga não encontrada.", codigo: rawCodigo };
  }

  // Owner não usa código — trigger já criou membership. Estado anômalo se cair aqui.
  // Redireciona pra liga sem mais nada.
  if (liga.owner_id === myId) {
    redirect(`/ligas/${liga.id}`);
  }

  // Já tem row? Pendente ou aprovado: idempotente — redireciona.
  const status = await getMeuStatusNaLiga(admin, liga.id, myId);
  if (status !== null) {
    redirect(`/ligas/${liga.id}`);
  }

  // Limite participando (Q1b: conta pendentes + aprovados).
  const totalMembro = await countLigasComoMembro(admin, myId);
  if (totalMembro >= LIMITE_LIGAS_PARTICIPANDO) {
    return {
      error: `Você já participa de ${LIMITE_LIGAS_PARTICIPANDO} ligas (limite).`,
      codigo: rawCodigo,
    };
  }

  const { error: insErr } = await admin.from("league_members").insert({
    league_id: liga.id,
    participant_id: myId,
    status: MEMBRO_STATUS.PENDENTE,
  });
  if (insErr) {
    // Race: virou membro entre check e insert. Redireciona pra liga.
    if (insErr.code === "23505") {
      redirect(`/ligas/${liga.id}`);
    }
    return {
      error: "Erro ao pedir entrada. Tenta de novo.",
      codigo: rawCodigo,
    };
  }

  revalidatePath("/ligas");
  revalidatePath("/dashboard");
  redirect(`/ligas/${liga.id}`);
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
