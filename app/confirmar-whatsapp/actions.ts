"use server";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { whatsappSchema } from "@/lib/validation/contato";

export async function confirmarWhatsapp(): Promise<void> {
  const session = await getSession();
  if (!session.participantId) redirect("/entrar");

  const supabase = getSupabaseAdmin();
  await supabase
    .from("participants")
    .update({ whatsapp_confirmed_at: new Date().toISOString() })
    .eq("id", session.participantId);

  redirect("/dashboard");
}

export type AtualizarWhatsappState = {
  error?: string;
  value?: string;
};

export async function atualizarWhatsapp(
  _prev: AtualizarWhatsappState,
  formData: FormData,
): Promise<AtualizarWhatsappState> {
  const session = await getSession();
  if (!session.participantId) redirect("/entrar");

  const raw = String(formData.get("whatsapp") ?? "");
  const parsed = whatsappSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "WhatsApp inválido",
      value: raw,
    };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("participants")
    .update({ whatsapp: parsed.data })
    .eq("id", session.participantId);

  if (error) {
    if (error.code === "23505") {
      return {
        error: "Esse WhatsApp já está em uso por outro cadastro.",
        value: raw,
      };
    }
    return {
      error: "Erro ao salvar. Tenta de novo em uns segundos.",
      value: raw,
    };
  }

  redirect("/confirmar-whatsapp");
}
