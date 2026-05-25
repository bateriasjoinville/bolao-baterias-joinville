"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { loginSchema, type LoginFieldErrors } from "@/lib/validation/login";

export type LoginState = {
  errors?: LoginFieldErrors;
  formError?: string;
  values?: {
    cpf?: string;
    whatsapp?: string;
    manter_conectado?: boolean;
  };
};

function flattenIssues(
  issues: readonly { path: PropertyKey[]; message: string }[],
): LoginFieldErrors {
  const out: LoginFieldErrors = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      (out as Record<string, string>)[key] = issue.message;
    }
  }
  return out;
}

export async function entrar(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    cpf: String(formData.get("cpf") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    manter_conectado: formData.get("manter_conectado") === "on",
    turnstileToken: String(formData.get("turnstileToken") ?? ""),
  };

  const values: LoginState["values"] = {
    cpf: raw.cpf,
    whatsapp: raw.whatsapp,
    manter_conectado: raw.manter_conectado,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: flattenIssues(parsed.error.issues), values };
  }

  const reqHeaders = await headers();
  const remoteIp =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    reqHeaders.get("x-real-ip") ??
    undefined;

  const captchaOk = await verifyTurnstileToken(
    parsed.data.turnstileToken,
    remoteIp,
  );
  if (!captchaOk) {
    return {
      formError: "Captcha falhou. Recarrega a página e tenta de novo.",
      values,
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("participants")
    .select("id")
    .eq("cpf", parsed.data.cpf)
    .eq("whatsapp", parsed.data.whatsapp)
    .maybeSingle();

  if (error || !data) {
    return {
      formError: "CPF ou WhatsApp não confere. Tenta de novo ou cadastra.",
      values,
    };
  }

  await createSession(data.id, { persist: parsed.data.manter_conectado });
  redirect("/dashboard");
}
