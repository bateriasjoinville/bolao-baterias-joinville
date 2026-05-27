import "server-only";

import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "@/lib/supabase/database.types";

export type HelpRequestRow =
  Database["public"]["Tables"]["help_requests"]["Row"];

export type HelpRequestStatus = "pendente" | "resolvido";

export async function listHelpRequests(
  admin: SupabaseClient<Database>,
  status: HelpRequestStatus,
): Promise<HelpRequestRow[]> {
  const { data, error } = await admin
    .from("help_requests")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function countPendentes(
  admin: SupabaseClient<Database>,
): Promise<number> {
  const { count, error } = await admin
    .from("help_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pendente");
  if (error) throw error;
  return count ?? 0;
}
