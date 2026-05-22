// Cliente Supabase com service_role: bypassa RLS por completo.
// Uso restrito: seed, audit_logs, ops admin, leituras amplas (ex. mini-ranking
// de uma liga via league_members) com verificação manual de autorização ANTES.
// NUNCA expor a clientes. NUNCA passar por Server Action sem checar quem chama.
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

import type { Database } from "./database.types";

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (cached) return cached;
  cached = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
  return cached;
}
