"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  helpRequestSchema,
  type HelpRequestFieldErrors,
} from "@/lib/validation/help-request";

export type HelpRequestState = {
  errors?: HelpRequestFieldErrors;
  formError?: string;
  values?: {
    nome?: string;
    cpf_parcial?: string;
    whatsapp_parcial?: string;
    mensagem?: string;
  };
};

function flattenIssues(
  issues: readonly { path: PropertyKey[]; message: string }[],
): HelpRequestFieldErrors {
  const out: HelpRequestFieldErrors = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      (out as Record<string, string>)[key] = issue.message;
    }
  }
  return out;
}

export async function solicitarAjuda(
  _prev: HelpRequestState,
  formData: FormData,
): Promise<HelpRequestState> {
  const raw = {
    nome: String(formData.get("nome") ?? ""),
    cpf_parcial: String(formData.get("cpf_parcial") ?? ""),
    whatsapp_parcial: String(formData.get("whatsapp_parcial") ?? ""),
    mensagem: String(formData.get("mensagem") ?? ""),
    turnstileToken: String(formData.get("turnstileToken") ?? ""),
  };

  const values: HelpRequestState["values"] = {
    nome: raw.nome,
    cpf_parcial: raw.cpf_parcial,
    whatsapp_parcial: raw.whatsapp_parcial,
    mensagem: raw.mensagem,
  };

  const parsed = helpRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: flattenIssues(parsed.error.issues),
      values,
    };
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
  const { error } = await supabase.from("help_requests").insert({
    nome: parsed.data.nome,
    cpf_parcial: parsed.data.cpf_parcial,
    whatsapp_parcial: parsed.data.whatsapp_parcial,
    mensagem: parsed.data.mensagem,
  });

  if (error) {
    return {
      formError: "Erro ao enviar. Tenta de novo em uns segundos.",
      values,
    };
  }

  redirect("/esqueci-os-dados/enviado");
}
