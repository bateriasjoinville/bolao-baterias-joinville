import "server-only";

import {
  getIronSession,
  type IronSession,
  type SessionOptions,
} from "iron-session";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export const SESSION_COOKIE_NAME = "bolao_session";

export type SessionData = {
  participantId?: string;
};

const PERSISTENT_TTL_SECONDS = 60 * 60 * 24 * 30;
const SESSION_ONLY_TTL_SECONDS = 60 * 60 * 24;

const persistentOptions: SessionOptions = {
  cookieName: SESSION_COOKIE_NAME,
  password: env.SESSION_SECRET,
  ttl: PERSISTENT_TTL_SECONDS,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PERSISTENT_TTL_SECONDS,
  },
};

const sessionOnlyOptions: SessionOptions = {
  cookieName: SESSION_COOKIE_NAME,
  password: env.SESSION_SECRET,
  ttl: SESSION_ONLY_TTL_SECONDS,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const store = await cookies();
  return await getIronSession<SessionData>(store, persistentOptions);
}

export async function createSession(
  participantId: string,
  options?: { persist?: boolean },
): Promise<void> {
  const persist = options?.persist ?? true;
  const store = await cookies();
  const session = await getIronSession<SessionData>(
    store,
    persist ? persistentOptions : sessionOnlyOptions,
  );
  session.participantId = participantId;
  await session.save();
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
