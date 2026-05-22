import "server-only";

import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export const SESSION_COOKIE_NAME = "bolao_session";

export type SessionData = {
  participantId?: string;
};

const sessionOptions: SessionOptions = {
  cookieName: SESSION_COOKIE_NAME,
  password: env.SESSION_SECRET,
  ttl: 60 * 60 * 24 * 30,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const store = await cookies();
  return await getIronSession<SessionData>(store, sessionOptions);
}

export async function createSession(participantId: string): Promise<void> {
  const session = await getSession();
  session.participantId = participantId;
  await session.save();
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
