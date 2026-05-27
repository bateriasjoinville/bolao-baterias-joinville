import { z } from "zod";

import { BAIRROS_OPCOES } from "@/lib/validation/bairros";
import {
  cpfSchema,
  turnstileTokenSchema,
  whatsappSchema,
} from "@/lib/validation/contato";

export const nomeSchema = z
  .string()
  .trim()
  .min(3, "Informe seu nome")
  .max(120, "Nome muito longo")
  .refine(
    (v) => v.split(/\s+/).filter(Boolean).length >= 2,
    "Informe nome e sobrenome",
  );

export const idadeSchema = z.coerce
  .number({ message: "Informe sua idade" })
  .int("Idade inválida")
  .min(18, "Cadastro só pra maiores de 18")
  .max(120, "Idade inválida");

export const bairroSchema = z.enum(BAIRROS_OPCOES, {
  message: "Escolha um bairro",
});

export const instagramSchema = z
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

const aceiteObrigatorioSchema = z.literal(true, {
  message: "Aceite obrigatório",
});

export const cadastroSchema = z.object({
  nome: nomeSchema,
  cpf: cpfSchema,
  whatsapp: whatsappSchema,
  idade: idadeSchema,
  bairro: bairroSchema,
  instagram: instagramSchema,
  aceite_regulamento: aceiteObrigatorioSchema,
  aceite_comunicacoes: z.boolean(),
  turnstileToken: turnstileTokenSchema,
});

export type CadastroInput = z.infer<typeof cadastroSchema>;
export type CadastroFieldErrors = Partial<
  Record<keyof CadastroInput, string>
>;
