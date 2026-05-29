import { z } from "zod";

import {
  DESCRICAO_LIGA_MAX,
  NOME_LIGA_MAX,
  NOME_LIGA_MIN,
} from "@/lib/leagues/types";

export const nomeLigaSchema = z
  .string()
  .min(1, "Informe um nome.")
  .transform((v) => v.trim())
  .pipe(
    z
      .string()
      .min(NOME_LIGA_MIN, `Nome muito curto (mínimo ${NOME_LIGA_MIN} caracteres).`)
      .max(NOME_LIGA_MAX, `Nome muito longo (máximo ${NOME_LIGA_MAX} caracteres).`),
  );

export const descricaoLigaSchema = z
  .string()
  .max(DESCRICAO_LIGA_MAX, `Descrição muito longa (máximo ${DESCRICAO_LIGA_MAX} caracteres).`)
  .nullable();

export const codigoConviteSchema = z
  .string()
  .min(1, "Informe o código de convite.")
  .transform((v) => v.trim().toUpperCase())
  .pipe(
    z.string().regex(/^[A-Z0-9]{6,10}$/, "Código de convite inválido."),
  );

export const uuidSchema = z.string().uuid("ID inválido.");

export const criarLigaInputSchema = z.object({
  nome: nomeLigaSchema,
  descricao: descricaoLigaSchema,
});

export type CriarLigaInput = z.infer<typeof criarLigaInputSchema>;
