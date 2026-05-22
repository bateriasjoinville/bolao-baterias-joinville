// Assinatura HS256 com SUPABASE_JWT_SECRET (legacy "Previously used" no painel
// Supabase > JWT Signing Keys). A key atual do projeto é ES256, mas a private
// key dela não é extraível — só Supabase Auth pode assinar com ela.
// A legacy HS256 está em modo verify-only: PostgREST aceita JWT com
// alg=HS256 e sem header `kid` caindo no fallback do legacy secret.
// Migração futura, se o projeto for prolongado pós-Copa: third-party auth com
// par EC próprio + JWKS hospedado em rota pública. As policies RLS não mudam
// (continuam lendo auth.jwt() ->> 'participant_id'), só o lado de quem assina.
import "server-only";

import { SignJWT, jwtVerify } from "jose";

import { env } from "@/lib/env";

const JWT_TTL_SECONDS = 60 * 60;

const secretKey = () => new TextEncoder().encode(env.SUPABASE_JWT_SECRET);

export type SupabaseJwtClaims = {
  sub: string;
  participant_id: string;
  role: "authenticated";
  exp: number;
  iat: number;
};

export async function signSupabaseJwt(participantId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({
    participant_id: participantId,
    role: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(participantId)
    .setIssuedAt(now)
    .setExpirationTime(now + JWT_TTL_SECONDS)
    .sign(secretKey());
}

export async function verifySupabaseJwt(
  token: string,
): Promise<SupabaseJwtClaims> {
  const { payload } = await jwtVerify(token, secretKey(), {
    algorithms: ["HS256"],
  });
  return payload as SupabaseJwtClaims;
}
