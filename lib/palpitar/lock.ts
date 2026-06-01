export const LOCK_WINDOW_MINUTES = 60;

export function minsToKickoff(
  kickoffAt: string,
  now: Date = new Date(),
): number {
  return Math.floor((new Date(kickoffAt).getTime() - now.getTime()) / 60000);
}

export function isMatchLocked(
  kickoffAt: string,
  now: Date = new Date(),
): boolean {
  return minsToKickoff(kickoffAt, now) <= LOCK_WINDOW_MINUTES;
}

export function lockLabel(
  kickoffAt: string,
  now: Date = new Date(),
): string {
  const mins = minsToKickoff(kickoffAt, now);
  if (mins <= 0) return "Já começou";
  return `Começa em ${mins} min`;
}

export type LockTier = "tranquilo" | "perto" | "urgente" | "locked";

export function minsToLock(
  kickoffAt: string,
  now: Date = new Date(),
): number {
  return minsToKickoff(kickoffAt, now) - LOCK_WINDOW_MINUTES;
}

export function lockTier(
  kickoffAt: string,
  now: Date = new Date(),
): LockTier {
  const mins = minsToLock(kickoffAt, now);
  if (mins <= 0) return "locked";
  if (mins <= 15) return "urgente";
  if (mins < 60) return "perto";
  return "tranquilo";
}
