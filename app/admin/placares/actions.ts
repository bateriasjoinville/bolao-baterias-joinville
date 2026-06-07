"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/session";
import { PLACAR_MAX, PLACAR_MIN } from "@/lib/validation/palpite";
import {
  recalculateAllPoints,
  type RecalculateResult,
} from "@/lib/scoring/recalculate";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { type Json } from "@/lib/supabase/database.types";

const placarSchema = z.number().int().min(PLACAR_MIN).max(PLACAR_MAX);

const itemSchema = z.union([
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

const loteSchema = z.array(itemSchema).min(1).max(120);

export type SalvarPlacarLoteItem = z.input<typeof itemSchema>;

export type SalvarLoteResult =
  | {
      ok: true;
      novos: number;
      edicoes: number;
      limpos: number;
      falhas: number[];
      recalculated: RecalculateResult;
    }
  | { ok: false; error: string };

type CurrentMatch = {
  id: number;
  placar_a: number | null;
  placar_b: number | null;
  selecao_a: { nome: string };
  selecao_b: { nome: string };
};

export async function salvarPlacaresEmLote(
  itens: SalvarPlacarLoteItem[],
): Promise<SalvarLoteResult> {
  await requireAdmin();

  const parsed = loteSchema.safeParse(itens);
  if (!parsed.success) {
    return { ok: false, error: "Entrada inválida." };
  }

  const admin = getSupabaseAdmin();
  const ids = parsed.data.map((i) => i.matchId);

  const { data: currentData, error: curErr } = await admin
    .from("matches")
    .select(
      "id, placar_a, placar_b, selecao_a:selecao_a_id(nome), selecao_b:selecao_b_id(nome)",
    )
    .in("id", ids);
  if (curErr) {
    return { ok: false, error: curErr.message };
  }
  const current = new Map<number, CurrentMatch>();
  for (const m of (currentData ?? []) as unknown as CurrentMatch[]) {
    current.set(m.id, m);
  }

  type LogEntry = {
    admin_action: string;
    payload: Json;
    ip_address: string | null;
  };

  const reqHeaders = await headers();
  const remoteIp =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    reqHeaders.get("x-real-ip") ??
    null;

  const logs: LogEntry[] = [];
  const falhas: number[] = [];
  let novos = 0;
  let edicoes = 0;
  let limpos = 0;

  for (const item of parsed.data) {
    const cur = current.get(item.matchId);
    const oldA = cur?.placar_a ?? null;
    const oldB = cur?.placar_b ?? null;
    const tinha = oldA != null && oldB != null;

    const clear = "clear" in item && item.clear === true;
    const newA = clear ? null : item.placarA;
    const newB = clear ? null : item.placarB;

    // Sem mudança real → não toca no banco nem registra log.
    if (oldA === newA && oldB === newB) continue;

    const { error: updErr } = await admin
      .from("matches")
      .update({ placar_a: newA, placar_b: newB })
      .eq("id", item.matchId);
    if (updErr) {
      falhas.push(item.matchId);
      continue;
    }

    const nomeA = cur?.selecao_a.nome ?? "?";
    const nomeB = cur?.selecao_b.nome ?? "?";

    if (clear) {
      limpos += 1;
      logs.push({
        admin_action: "placar_limpo",
        payload: {
          match_id: item.matchId,
          selecao_a: nomeA,
          selecao_b: nomeB,
          de: { a: oldA, b: oldB },
          para: null,
        },
        ip_address: remoteIp,
      });
    } else if (tinha) {
      edicoes += 1;
      logs.push({
        admin_action: "placar_editado",
        payload: {
          match_id: item.matchId,
          selecao_a: nomeA,
          selecao_b: nomeB,
          de: { a: oldA, b: oldB },
          para: { a: newA, b: newB },
        },
        ip_address: remoteIp,
      });
    } else {
      novos += 1;
      logs.push({
        admin_action: "placar_lancado",
        payload: {
          match_id: item.matchId,
          selecao_a: nomeA,
          selecao_b: nomeB,
          de: null,
          para: { a: newA, b: newB },
        },
        ip_address: remoteIp,
      });
    }
  }

  if (logs.length > 0) {
    // Falha de auditoria não pode derrubar o salvamento do placar.
    const { error: logErr } = await admin.from("audit_logs").insert(logs);
    if (logErr) {
      console.error("[placares] falha ao gravar audit_logs:", logErr.message);
    }
  }

  let recalculated: RecalculateResult;
  try {
    recalculated = await recalculateAllPoints(admin);
  } catch (err) {
    return {
      ok: false,
      error: `Placares salvos, mas o recálculo falhou: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  revalidatePath("/admin/placares");
  revalidatePath("/dashboard");
  revalidatePath("/ranking");

  return { ok: true, novos, edicoes, limpos, falhas, recalculated };
}

export type RecalcularTudoResult =
  | { ok: true; recalculated: RecalculateResult }
  | { ok: false; error: string };

export async function recalcularTudo(): Promise<RecalcularTudoResult> {
  await requireAdmin();
  try {
    const admin = getSupabaseAdmin();
    const recalculated = await recalculateAllPoints(admin);
    revalidatePath("/admin/placares");
    revalidatePath("/dashboard");
    revalidatePath("/ranking");
    return { ok: true, recalculated };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
