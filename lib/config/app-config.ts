import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const POPUP_LEMBRETE_KEY = "popup_lembrete";

export const POPUP_LEMBRETE_DEFAULT = {
  enabled: false,
  titulo: "Bora palpitar!",
  mensagem: "Tem jogo chegando que você ainda não palpitou. Garanta seus pontos! ⚽",
} as const;

export type PopupLembrete = {
  enabled: boolean;
  titulo: string;
  mensagem: string;
  version: string;
};

type StoredPopupLembrete = {
  enabled?: unknown;
  titulo?: unknown;
  mensagem?: unknown;
};

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

export async function getPopupLembrete(): Promise<PopupLembrete> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("app_config")
    .select("value, updated_at")
    .eq("key", POPUP_LEMBRETE_KEY)
    .maybeSingle();

  if (!data) {
    return { ...POPUP_LEMBRETE_DEFAULT, version: "default" };
  }

  const value = (data.value ?? {}) as StoredPopupLembrete;
  return {
    enabled: value.enabled === true,
    titulo: asString(value.titulo, POPUP_LEMBRETE_DEFAULT.titulo),
    mensagem: asString(value.mensagem, POPUP_LEMBRETE_DEFAULT.mensagem),
    version: data.updated_at,
  };
}
