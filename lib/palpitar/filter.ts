import { type MatchRow } from "@/lib/dashboard/queries";

export type TabKey =
  | "hoje"
  | "grupos"
  | "r32"
  | "oitavas"
  | "quartas"
  | "semi"
  | "terceiro"
  | "final"
  | "todos";

export const ALL_TAB_KEYS: TabKey[] = [
  "hoje",
  "grupos",
  "r32",
  "oitavas",
  "quartas",
  "semi",
  "terceiro",
  "final",
  "todos",
];

export const TAB_LABELS: Record<TabKey, string> = {
  hoje: "Hoje",
  grupos: "Grupos",
  r32: "32ª",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semi: "Semi",
  terceiro: "3º",
  final: "Final",
  todos: "Todos",
};

const FASE_BY_TAB: Partial<Record<TabKey, string>> = {
  grupos: "grupos",
  r32: "r32",
  oitavas: "oitavas",
  quartas: "quartas",
  semi: "semifinais",
  terceiro: "terceiro",
  final: "final",
};

function ymdSP(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function isMatchToday(
  match: Pick<MatchRow, "kickoff_at">,
  now: Date = new Date(),
): boolean {
  return ymdSP(new Date(match.kickoff_at)) === ymdSP(now);
}

export function parseTab(raw: string | undefined): TabKey {
  if (raw && (ALL_TAB_KEYS as string[]).includes(raw)) {
    return raw as TabKey;
  }
  return "todos";
}

export function filtrarPorTab(matches: MatchRow[], tab: TabKey): MatchRow[] {
  if (tab === "todos") return matches;
  if (tab === "hoje") return matches.filter((m) => isMatchToday(m));
  const fase = FASE_BY_TAB[tab];
  if (!fase) return matches;
  return matches.filter((m) => m.fase === fase);
}
