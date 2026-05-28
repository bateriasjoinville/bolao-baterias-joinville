"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  cadastroSchema,
  type CadastroFieldErrors,
} from "@/lib/validation/cadastro";

export type CadastroState = {
  errors?: CadastroFieldErrors;
  formError?: string;
  cpfDuplicadoDigits?: string;
  values?: {
    nome?: string;
    cpf?: string;
    whatsapp?: string;
    idade?: string;
    bairro?: string;
    instagram?: string;
    aceite_regulamento?: boolean;
    aceite_comunicacoes?: boolean;
  };
};

function flattenIssues(
  issues: readonly { path: PropertyKey[]; message: string }[],
): CadastroFieldErrors {
  const out: CadastroFieldErrors = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      (out as Record<string, string>)[key] = issue.message;
    }
  }
  return out;
}

export async function criarParticipante(
  _prev: CadastroState,
  formData: FormData,
): Promise<CadastroState> {
  const raw = {
    nome: String(formData.get("nome") ?? ""),
    cpf: String(formData.get("cpf") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    idade: String(formData.get("idade") ?? ""),
    bairro: String(formData.get("bairro") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    aceite_regulamento: formData.get("aceite_regulamento") === "on",
    aceite_comunicacoes: formData.get("aceite_comunicacoes") === "on",
    turnstileToken: String(formData.get("turnstileToken") ?? ""),
  };

  const values: CadastroState["values"] = {
    nome: raw.nome,
    cpf: raw.cpf,
    whatsapp: raw.whatsapp,
    idade: raw.idade,
    bairro: raw.bairro,
    instagram: raw.instagram,
    aceite_regulamento: raw.aceite_regulamento,
    aceite_comunicacoes: raw.aceite_comunicacoes,
  };

  const parsed = cadastroSchema.safeParse(raw);
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
  const { data, error } = await supabase
    .from("participants")
    .insert({
      nome: parsed.data.nome,
      cpf: parsed.data.cpf,
      whatsapp: parsed.data.whatsapp,
      idade: parsed.data.idade,
      bairro: parsed.data.bairro,
      instagram: parsed.data.instagram ? parsed.data.instagram : null,
      aceite_regulamento: parsed.data.aceite_regulamento,
      aceite_comunicacoes: parsed.data.aceite_comunicacoes,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        cpfDuplicadoDigits: parsed.data.cpf,
        values,
      };
    }
    return {
      formError: "Erro ao cadastrar. Tenta de novo em uns segundos.",
      values,
    };
  }

  await createSession(data.id);
  redirect("/confirmar-whatsapp");
}
