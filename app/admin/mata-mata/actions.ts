"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { type Database } from "@/lib/supabase/database.types";

const inputSchema = z.object({
  matchId: z.number().int().positive(),
  selecaoAId: z.number().int().positive().nullable(),
  selecaoBId: z.number().int().positive().nullable(),
  isBrasil: z.boolean(),
});

export type DefinirConfrontoInput = z.input<typeof inputSchema>;

export type DefinirConfrontoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function definirConfrontoMataMata(
  input: DefinirConfrontoInput,
): Promise<DefinirConfrontoResult> {
  await requireAdmin();

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Entrada inválida." };
  }
  const { matchId, selecaoAId, selecaoBId, isBrasil } = parsed.data;

  const admin = getSupabaseAdmin();

  const { data: match, error: matchErr } = await admin
    .from("matches")
    .select("id, fase, selecao_a_id, selecao_b_id")
    .eq("id", matchId)
    .maybeSingle();
  if (matchErr) return { ok: false, error: "Erro ao carregar o jogo." };
  if (!match) return { ok: false, error: "Jogo não encontrado." };
  if (match.fase === "grupos") {
    return { ok: false, error: "Esse jogo não é de mata-mata." };
  }

  const finalA = selecaoAId ?? match.selecao_a_id;
  const finalB = selecaoBId ?? match.selecao_b_id;
  if (finalA != null && finalB != null && finalA === finalB) {
    return {
      ok: false,
      error: "Os dois lados não podem ser a mesma seleção.",
    };
  }

  const update: Database["public"]["Tables"]["matches"]["Update"] = {
    is_brasil: isBrasil,
  };
  if (selecaoAId != null) {
    update.selecao_a_id = selecaoAId;
    update.placeholder_a = null;
  }
  if (selecaoBId != null) {
    update.selecao_b_id = selecaoBId;
    update.placeholder_b = null;
  }

  const { error: updErr } = await admin
    .from("matches")
    .update(update)
    .eq("id", matchId);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/admin/mata-mata");
  revalidatePath("/admin/placares");
  revalidatePath("/palpitar");
  revalidatePath("/dashboard");
  return { ok: true };
}
