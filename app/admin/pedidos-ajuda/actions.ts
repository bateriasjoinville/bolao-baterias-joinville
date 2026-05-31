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

const COLS = "id, nome, cpf, whatsapp, bairro, created_at";

function escapeIlike(value: string): string {
  return value.replace(/[%_]/g, "\\$&");
}

export async function buscarCadastros(
  input: z.input<typeof buscarCadastrosSchema>,
): Promise<BuscarCadastrosResult> {
  await requireAdmin();

  const parsed = buscarCadastrosSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ID inválido." };
  }

  const admin = getSupabaseAdmin();

  const { data: pedido, error: pedErr } = await admin
    .from("help_requests")
    .select("nome, cpf, whatsapp")
    .eq("id", parsed.data.helpRequestId)
    .single();

  if (pedErr || !pedido) {
    return { ok: false, error: "Pedido não encontrado." };
  }

  const acumulado = new Map<string, CadastroEncontrado>();

  const nomeEsc = escapeIlike(pedido.nome.trim());
  if (nomeEsc.length >= 2) {
    const r1 = await admin
      .from("participants")
      .select(COLS)
      .ilike("nome", `%${nomeEsc}%`)
      .limit(20);
    if (r1.error) return { ok: false, error: r1.error.message };
    for (const p of r1.data ?? []) acumulado.set(p.id, p);
  }

  if (pedido.cpf && acumulado.size < 20) {
    const r2 = await admin
      .from("participants")
      .select(COLS)
      .eq("cpf", pedido.cpf)
      .limit(20);
    if (r2.error) return { ok: false, error: r2.error.message };
    for (const p of r2.data ?? []) acumulado.set(p.id, p);
  }

  if (pedido.whatsapp && acumulado.size < 20) {
    const r3 = await admin
      .from("participants")
      .select(COLS)
      .eq("whatsapp", pedido.whatsapp)
      .limit(20);
    if (r3.error) return { ok: false, error: r3.error.message };
    for (const p of r3.data ?? []) acumulado.set(p.id, p);
  }

  return {
    ok: true,
    resultados: Array.from(acumulado.values()).slice(0, 20),
  };
}
