"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/session";
import { POPUP_LEMBRETE_KEY } from "@/lib/config/app-config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({
  enabled: z.boolean(),
  titulo: z.string().trim().min(3).max(60),
  mensagem: z.string().trim().min(5).max(200),
});

export type SalvarPopupResult = { ok: true } | { ok: false; error: string };

export async function salvarPopupLembrete(
  input: z.input<typeof schema>,
): Promise<SalvarPopupResult> {
  await requireAdmin();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Preencha título (3+) e mensagem (5+)." };
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("app_config").upsert(
    {
      key: POPUP_LEMBRETE_KEY,
      value: parsed.data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) {
    return { ok: false, error: error.message };
  }

  const reqHeaders = await headers();
  const remoteIp =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const { error: logErr } = await admin.from("audit_logs").insert({
    admin_action: "popup_lembrete_atualizado",
    payload: parsed.data,
    ip_address: remoteIp,
  });
  if (logErr) {
    console.error("[avisos] falha ao gravar audit_logs:", logErr.message);
  }

  revalidatePath("/admin/avisos");
  return { ok: true };
}
