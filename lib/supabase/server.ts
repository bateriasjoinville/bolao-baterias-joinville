// Clientes Supabase pra Server Components / Server Actions / Route Handlers.
//
// - `createAuthedServerClient()`: requer sessão. Lê o cookie iron-session,
//   gera um JWT custom HS256 fresco com `participant_id` no claim, injeta
//   no header Authorization. Cada chamada gera client novo porque o JWT
//   muda por request. Redireciona pra /entrar se não há sessão.
//
// - `createAnonServerClient()`: sem JWT, só anon key. Pra leituras públicas
//   (selecoes, matches sem ranking). Cliente é cacheado entre requests.
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { signSupabaseJwt } from "@/lib/jwt";
import { getSession } from "@/lib/session";

import type { Database } from "./database.types";

export async function createAuthedServerClient(): Promise<
  SupabaseClient<Database>
> {
  const session = await getSession();
  if (!session.participantId) {
    redirect("/entrar");
  }
  const jwt = await signSupabaseJwt(session.participantId);
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    },
  );
}

let anonCached: SupabaseClient<Database> | null = null;

export function createAnonServerClient(): SupabaseClient<Database> {
  if (anonCached) return anonCached;
  anonCached = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
  return anonCached;
}
