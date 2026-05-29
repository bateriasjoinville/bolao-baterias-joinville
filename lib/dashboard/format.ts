const COPA_START_ISO = "2026-06-11T00:00:00-03:00";
const COPA_START = new Date(COPA_START_ISO);

const TIME_ZONE = "America/Sao_Paulo";

export function isPreCopa(now: Date = new Date()): boolean {
  return now < COPA_START;
}

export function diasParaCopa(now: Date = new Date()): number {
  const ms = COPA_START.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function primeiroNome(nome: string): string {
  const first = nome.trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : "participante";
}

function getPart(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((p) => p.type === type)?.value ?? "";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatMatchDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const parts = fmt.formatToParts(d);
  const weekday = getPart(parts, "weekday").replace(".", "");
  const day = getPart(parts, "day");
  const month = getPart(parts, "month").replace(".", "");
  return `${capitalize(weekday)} ${day}/${month}`;
}

export function formatMatchTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(d);
  const hour = getPart(parts, "hour");
  const minute = getPart(parts, "minute");
  return minute === "00" ? `${hour}h` : `${hour}h${minute}`;
}

export function formatMatchDateTime(date: Date | string): string {
  return `${formatMatchDate(date)} · ${formatMatchTime(date)}`;
}

const PALPITES_OPEN_ISO = "2026-05-29T00:00:00-03:00";
export const PALPITES_OPEN_AT = new Date(PALPITES_OPEN_ISO);

// Janela global da captação de palpites. Abre 29/mai 00:00 BRT.
// Regra match-specific de "até 1h antes do jogo" é aplicada separadamente
// na lógica de cada match. Override de dev via NEXT_PUBLIC_PALPITES_FORCE_OPEN.
export function palpitesAbertos(now: Date = new Date()): boolean {
  if (process.env.NEXT_PUBLIC_PALPITES_FORCE_OPEN === "true") return true;
  return now >= PALPITES_OPEN_AT;
}

function brtDateKey(d: Date): string {
  return new Date(d.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function diffCalendarDays(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00Z`).getTime();
  const to = new Date(`${toKey}T00:00:00Z`).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

export function microcopyAberturaPalpites(
  now: Date = new Date(),
): string | null {
  const ms = PALPITES_OPEN_AT.getTime() - now.getTime();
  if (ms <= 0) return null;

  const horas = ms / (1000 * 60 * 60);
  if (horas < 12) return "Palpites abrem hoje à meia-noite";

  const dias = diffCalendarDays(brtDateKey(now), brtDateKey(PALPITES_OPEN_AT));
  if (dias <= 1) return "Palpites abrem amanhã";
  return `Palpites abrem em ${dias} dias`;
}
