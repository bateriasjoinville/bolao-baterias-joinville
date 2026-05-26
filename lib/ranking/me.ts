export function findMyEntry<T extends { participantId: string }>(
  entries: T[],
  myId: string,
): T | null {
  return entries.find((e) => e.participantId === myId) ?? null;
}
