import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { stripDigits } from "@/lib/format";
import { type Database } from "@/lib/supabase/database.types";

export type ParticipantRow = {
  id: string;
  nome: string;
  cpf: string;
  whatsapp: string;
  cidade: string;
  estado: string;
  bairro: string | null;
  idade: number;
  instagram: string | null;
  created_at: string;
  whatsapp_confirmed_at: string | null;
};

type Admin = SupabaseClient<Database>;

const COLS =
  "id, nome, cpf, whatsapp, cidade, estado, bairro, idade, instagram, created_at, whatsapp_confirmed_at";

export const PAGE_SIZE = 50;

function buildOrFilter(termo: string): string | null {
  const cleaned = termo.trim();
  const nome = cleaned
    .replace(/[%_,()\\*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const digits = stripDigits(cleaned);

  const parts: string[] = [];
  if (nome.length >= 2) parts.push(`nome.ilike.%${nome}%`);
  if (digits.length >= 2) {
    parts.push(`cpf.ilike.%${digits}%`);
    parts.push(`whatsapp.ilike.%${digits}%`);
  }
  return parts.length > 0 ? parts.join(",") : null;
}

export async function countParticipants(admin: Admin): Promise<number> {
  const { count, error } = await admin
    .from("participants")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function listParticipants(
  admin: Admin,
  opts: { limit: number; offset: number },
): Promise<{ rows: ParticipantRow[]; total: number }> {
  const { data, error, count } = await admin
    .from("participants")
    .select(COLS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(opts.offset, opts.offset + opts.limit - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function searchParticipants(
  admin: Admin,
  termo: string,
  opts: { limit: number; offset: number },
): Promise<{ rows: ParticipantRow[]; total: number }> {
  const orFilter = buildOrFilter(termo);
  if (!orFilter) return { rows: [], total: 0 };

  const { data, error, count } = await admin
    .from("participants")
    .select(COLS, { count: "exact" })
    .or(orFilter)
    .order("created_at", { ascending: false })
    .range(opts.offset, opts.offset + opts.limit - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getParticipantsForExport(
  admin: Admin,
): Promise<ParticipantRow[]> {
  const all: ParticipantRow[] = [];
  const batch = 1000;
  let offset = 0;

  for (;;) {
    const { data, error } = await admin
      .from("participants")
      .select(COLS)
      .order("created_at", { ascending: false })
      .range(offset, offset + batch - 1);
    if (error) throw error;

    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < batch) break;
    offset += batch;
  }

  return all;
}
