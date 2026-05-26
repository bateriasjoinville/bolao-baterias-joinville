import { JANELAS, type SemanaIndex } from "@/lib/scoring/weeks";

export function semanasVisiveis(now: Date = new Date()): SemanaIndex[] {
  const t = now.getTime();
  return JANELAS.filter((j) => t >= new Date(j.inicio).getTime()).map(
    (j) => j.semana,
  );
}
