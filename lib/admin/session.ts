import "server-only";

import {
  getIronSession,
  type IronSession,
  type SessionOptions,
} from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";

export const ADMIN_SESSION_COOKIE_NAME = "bolao_admin";

export type AdminSessionData = {
  isAdmin?: boolean;
  loggedAt?: number;
};

const TTL_SECONDS = 60 * 60 * 24;

const adminSessionOptions: SessionOptions = {
  cookieName: ADMIN_SESSION_COOKIE_NAME,
  password: env.ADMIN_SESSION_SECRET,
  ttl: TTL_SECONDS,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  },
};

export async function getAdminSession(): Promise<IronSession<AdminSessionData>> {
  const store = await cookies();
  return await getIronSession<AdminSessionData>(store, adminSessionOptions);
}

export async function createAdminSession(): Promise<void> {
  const session = await getAdminSession();
  session.isAdmin = true;
  session.loggedAt = Date.now();
  await session.save();
}

export async function destroyAdminSession(): Promise<void> {
  const session = await getAdminSession();
  session.destroy();
}

export async function requireAdmin(): Promise<void> {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    redirect("/admin/auth");
  }
}
