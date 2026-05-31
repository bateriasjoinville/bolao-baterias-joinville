import "server-only";

import { codigoConviteSchema } from "@/lib/validation/liga";

import { countLigasComoMembro, getMeuStatusNaLiga } from "./queries";
import { LIMITE_LIGAS_PARTICIPANDO, MEMBRO_STATUS } from "./types";

import type { getSupabaseAdmin } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof getSupabaseAdmin>;

export const ERRO_LIGA_OFICIAL =
  "Liga oficial — todo participante faz parte automaticamente.";

export type EntrarResult =
  | { ok: true; ligaId: string }
  | { ok: false; error: string };

// Normaliza e valida um código de convite vindo de URL/form. Retorna o código
// em maiúsculas ou null se inválido/ausente.
export function parseConvite(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const parsed = codigoConviteSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

// Núcleo da entrada numa liga (por código OU por busca). Liga pública → vira
// membro aprovado direto; privada → cria pedido pendente (fluxo atual).
// Idempotente: owner ou já-membro retorna ok sem mexer em nada.
export async function entrarEmLiga(
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

// Resolve a liga pelo código e entra. Bloqueia ligas oficiais (sem dono).
// Usado pela landing de convite E pelos fluxos de login/cadastro.
export async function entrarPorCodigo(
  admin: Admin,
  codigo: string,
  myId: string,
): Promise<EntrarResult> {
  const { data: liga, error: ligaErr } = await admin
    .from("leagues")
    .select("id, owner_id, is_publica, is_oficial")
    .eq("codigo_convite", codigo)
    .maybeSingle();
  if (ligaErr) return { ok: false, error: "Erro ao verificar o código." };
  if (!liga) return { ok: false, error: "Liga não encontrada." };
  if (liga.is_oficial || liga.owner_id === null) {
    return { ok: false, error: ERRO_LIGA_OFICIAL };
  }

  return entrarEmLiga(
    admin,
    { id: liga.id, owner_id: liga.owner_id, is_publica: liga.is_publica },
    myId,
  );
}
