import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { getRankingGeral } from "@/lib/ranking/queries";
import { assignRanks, rankKey } from "@/lib/ranking/rank";
import { type Database } from "@/lib/supabase/database.types";

export type Top10Entry = {
  posicao: number;
  displayName: string;
  instagram: string | null;
  pontos: number;
};

// O @ é salvo sem "@" (o schema de cadastro tira). Garante o "@" na frente e
// remove espaços. Vazio/nulo → null (sem @ informado).
export function normalizeInstagram(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const handle = raw.replace(/\s+/g, "").replace(/^@+/, "");
  return handle ? `@${handle}` : null;
}

// Top 10 do ranking geral AO VIVO (mesma fonte e mesmas posições do /ranking),
// com o @ do Instagram de cada um (quando informado no cadastro).
export async function getTop10ForInstagram(
  admin: SupabaseClient<Database>,
): Promise<Top10Entry[]> {
  const entries = await getRankingGeral(admin);
  const ranked = assignRanks(entries, rankKey);
  const top10 = ranked.slice(0, 10);

  const ids = top10.map((e) => e.participantId);
  const instagramById = new Map<string, string | null>();
  if (ids.length > 0) {
    const { data, error } = await admin
      .from("participants")
      .select("id, instagram")
      .in("id", ids);
    if (error) throw error;
    for (const p of data ?? []) {
      instagramById.set(p.id, normalizeInstagram(p.instagram));
    }
  }

  return top10.map((e) => ({
    posicao: e.posicao,
    displayName: e.displayName,
    instagram: instagramById.get(e.participantId) ?? null,
    pontos: e.pontos,
  }));
}

// Texto "@a @b @c" só de quem tem @, na ordem do ranking.
export function atsLine(entries: Top10Entry[]): string {
  return entries
    .map((e) => e.instagram)
    .filter((h): h is string => Boolean(h))
    .join(" ");
}
