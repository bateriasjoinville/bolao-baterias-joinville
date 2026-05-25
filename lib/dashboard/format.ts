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

// TODO: data de abertura da janela de palpites é decisão de negócio pendente.
// Regra real: palpite editável até 1h antes de cada jogo.
export function palpitesAbertos(): boolean {
  return false;
}
