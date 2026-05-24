import { z } from "zod";

import { stripDigits } from "@/lib/format";
import { BAIRROS_OPCOES } from "@/lib/validation/bairros";
import { isValidCPF } from "@/lib/validation/cpf";
import { DDDS_VALIDOS } from "@/lib/validation/ddd";

const nomeSchema = z
  .string()
  .trim()
  .min(3, "Informe seu nome")
  .max(120, "Nome muito longo")
  .refine(
    (v) => v.split(/\s+/).filter(Boolean).length >= 2,
    "Informe nome e sobrenome",
  );

const cpfSchema = z
  .string()
  .min(1, "Informe o CPF")
  .transform(stripDigits)
  .pipe(
    z
      .string()
      .length(11, "CPF precisa ter 11 dígitos")
      .refine(isValidCPF, "CPF inválido"),
  );

const whatsappSchema = z
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

const idadeSchema = z.coerce
  .number({ message: "Informe sua idade" })
  .int("Idade inválida")
  .min(18, "Cadastro só pra maiores de 18")
  .max(120, "Idade inválida");

const bairroSchema = z.enum(BAIRROS_OPCOES, { message: "Escolha um bairro" });

const instagramSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/^@+/, ""))
  .pipe(
    z
      .string()
      .regex(/^[A-Za-z0-9._]{1,30}$/, "@ do Instagram inválido")
      .or(z.literal("")),
  )
  .optional();

const aceiteSchema = z.literal(true, { message: "Aceite obrigatório" });

const turnstileTokenSchema = z
  .string()
  .min(1, "Falha no captcha. Recarrega a página.");

export const cadastroSchema = z.object({
  nome: nomeSchema,
  cpf: cpfSchema,
  whatsapp: whatsappSchema,
  idade: idadeSchema,
  bairro: bairroSchema,
  instagram: instagramSchema,
  aceite_regulamento: aceiteSchema,
  aceite_comunicacoes: aceiteSchema,
  turnstileToken: turnstileTokenSchema,
});

export type CadastroInput = z.infer<typeof cadastroSchema>;
export type CadastroFieldErrors = Partial<
  Record<keyof CadastroInput, string>
>;
