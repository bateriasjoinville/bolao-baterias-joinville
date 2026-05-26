"use server";

import { redirect } from "next/navigation";

import { createAdminSession } from "@/lib/admin/session";
import { env } from "@/lib/env";

export type AdminLoginState = {
  error?: string;
};

export async function loginAdmin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const token = formData.get("token");
  if (typeof token !== "string" || token.length === 0) {
    return { error: "Informe o token." };
  }

  if (!constantTimeEquals(token, env.ADMIN_TOKEN)) {
    return { error: "Token inválido." };
  }

  await createAdminSession();
  redirect("/admin/placares");
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
