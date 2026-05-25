import { z } from "zod";

export const PLACAR_MIN = 0;
export const PLACAR_MAX = 20;

const placarSchema = z
  .number()
  .int()
  .min(PLACAR_MIN)
  .max(PLACAR_MAX);

export const palpiteInputSchema = z.object({
  matchId: z.number().int().positive(),
  placarA: placarSchema,
  placarB: placarSchema,
});

export type PalpiteInput = z.infer<typeof palpiteInputSchema>;
