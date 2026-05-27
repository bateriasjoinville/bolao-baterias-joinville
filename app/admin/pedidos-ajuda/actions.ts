"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CadastroEncontrado = {
  id: string;
  nome: string;
  cpf: string;
  whatsapp: string;
  bairro: string;
  created_at: string;
};

export type BuscarCadastrosResult =
  | { ok: true; resultados: CadastroEncontrado[] }
  | { ok: false; error: string };

const buscarCadastrosSchema = z.object({
  helpRequestId: z.string().uuid(),
});

const marcarResolvidoSchema = z.object({
  id: z.string().uuid(),
});

export type MarcarResolvidoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function marcarResolvido(
  input: z.input<typeof marcarResolvidoSchema>,
): Promise<MarcarResolvidoResult> {
  await requireAdmin();

  const parsed = marcarResolvidoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ID inválido." };
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("help_requests")
    .update({ status: "resolvido", resolved_at: new Date().toISOString() })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/pedidos-ajuda");
  revalidatePath("/admin/placares");
  return { ok: true };
}
