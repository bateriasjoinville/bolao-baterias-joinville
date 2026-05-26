"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/session";
import { PLACAR_MAX, PLACAR_MIN } from "@/lib/validation/palpite";
import { recalculateAllPoints } from "@/lib/scoring/recalculate";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const placarSchema = z.number().int().min(PLACAR_MIN).max(PLACAR_MAX);

const inputSchema = z.union([
  z.object({
    matchId: z.number().int().positive(),
    placarA: placarSchema,
    placarB: placarSchema,
    clear: z.literal(false).optional(),
  }),
  z.object({
    matchId: z.number().int().positive(),
    clear: z.literal(true),
  }),
]);

export type SalvarPlacarInput = z.input<typeof inputSchema>;

export type SalvarPlacarResult =
  | { ok: true; recalculated: { participantsUpdated: number; weeklyEntriesUpdated: number; finalizedMatches: number } }
  | { ok: false; error: string };

export async function salvarPlacar(
  input: SalvarPlacarInput,
): Promise<SalvarPlacarResult> {
  await requireAdmin();

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Entrada inválida." };
  }

  const admin = getSupabaseAdmin();

  const update = parsed.data.clear
    ? { placar_a: null, placar_b: null }
    : { placar_a: parsed.data.placarA, placar_b: parsed.data.placarB };

  const { error: updErr } = await admin
    .from("matches")
    .update(update)
    .eq("id", parsed.data.matchId);
  if (updErr) {
    return { ok: false, error: updErr.message };
  }

  const recalculated = await recalculateAllPoints(admin);

  revalidatePath("/admin/placares");
  revalidatePath("/dashboard");

  return { ok: true, recalculated };
}
