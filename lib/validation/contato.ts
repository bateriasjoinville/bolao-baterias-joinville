import { z } from "zod";

import { stripDigits } from "@/lib/format";
import { isValidCPF } from "@/lib/validation/cpf";
import { DDDS_VALIDOS } from "@/lib/validation/ddd";

export const cpfSchema = z
  .string()
  .min(1, "Informe o CPF")
  .transform(stripDigits)
  .pipe(
    z
      .string()
      .length(11, "CPF precisa ter 11 dígitos")
      .refine(isValidCPF, "CPF inválido"),
  );

export const whatsappSchema = z
  .string()
  .min(1, "Informe o WhatsApp")
  .transform(stripDigits)
  .pipe(
    z
      .string()
      .regex(/^\d{10,11}$/, "WhatsApp precisa ter 10 ou 11 dígitos")
      .refine(
        (v) => DDDS_VALIDOS.has(v.slice(0, 2)),
        "DDD inválido",
      )
      .refine(
        (v) => v.length === 10 || v[2] === "9",
        "Celular precisa começar com 9 depois do DDD",
      ),
  );

export const turnstileTokenSchema = z
  .string()
  .min(1, "Falha no captcha. Recarrega a página.");
