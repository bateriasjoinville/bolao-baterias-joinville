"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/admin/session";
import {
  PAGE_SIZE,
  listParticipants,
  searchParticipants,
  type ParticipantRow,
} from "@/lib/admin/participants";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ListaResult =
  | { ok: true; rows: ParticipantRow[]; total: number }
  | { ok: false; error: string };

const pageSchema = z.object({
  termo: z.string().trim().max(120).optional(),
  offset: z.number().int().min(0).max(1_000_000),
});

export async function carregarCadastrados(
  input: z.input<typeof pageSchema>,
): Promise<ListaResult> {
  await requireAdmin();

  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Parâmetros inválidos." };
  }

  const admin = getSupabaseAdmin();
  const termo = parsed.data.termo?.trim() ?? "";

  try {
    const result =
      termo.length >= 2
        ? await searchParticipants(admin, termo, {
            limit: PAGE_SIZE,
            offset: parsed.data.offset,
          })
        : await listParticipants(admin, {
            limit: PAGE_SIZE,
            offset: parsed.data.offset,
          });
    return { ok: true, rows: result.rows, total: result.total };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erro ao carregar.",
    };
  }
}
