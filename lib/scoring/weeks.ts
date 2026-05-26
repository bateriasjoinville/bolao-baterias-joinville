// Janelas das 5 semanas do bolão (timezone America/Sao_Paulo)
// Semana 1: 11-14/jun (5 dias, abertura)
// Semana 2: 15-21/jun (Seg-Dom)
// Semana 3: 22-28/jun (Seg-Dom)
// Semana 4: 29/jun-5/jul (Seg-Dom)
// Semana 5: 6/jul-19/jul (14 dias, final + eliminatórias finais)

type Janela = {
  semana: 1 | 2 | 3 | 4 | 5;
  inicio: string; // ISO com offset -03:00
  fim: string; // exclusivo
};

const JANELAS: Janela[] = [
  { semana: 1, inicio: "2026-06-11T00:00:00-03:00", fim: "2026-06-15T00:00:00-03:00" },
  { semana: 2, inicio: "2026-06-15T00:00:00-03:00", fim: "2026-06-22T00:00:00-03:00" },
  { semana: 3, inicio: "2026-06-22T00:00:00-03:00", fim: "2026-06-29T00:00:00-03:00" },
  { semana: 4, inicio: "2026-06-29T00:00:00-03:00", fim: "2026-07-06T00:00:00-03:00" },
  { semana: 5, inicio: "2026-07-06T00:00:00-03:00", fim: "2026-07-20T00:00:00-03:00" },
];

export const TOTAL_SEMANAS = 5;
export type SemanaIndex = 1 | 2 | 3 | 4 | 5;

export function weekOfMatch(kickoffAt: string): SemanaIndex | null {
  const t = new Date(kickoffAt).getTime();
  for (const j of JANELAS) {
    if (t >= new Date(j.inicio).getTime() && t < new Date(j.fim).getTime()) {
      return j.semana;
    }
  }
  return null;
}

export function currentWeek(now: Date = new Date()): SemanaIndex {
  const t = now.getTime();
  for (const j of JANELAS) {
    if (t < new Date(j.fim).getTime()) return j.semana;
  }
  return 5;
}

export function semanaLabel(semana: SemanaIndex): string {
  return `Semana ${semana}`;
}
