import "server-only";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const SITEVERIFY_TIMEOUT_MS = 8000;

type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export type TurnstileResult =
  | { outcome: "ok" }
  | { outcome: "rejected"; codes: string[] }
  | { outcome: "unreachable"; reason: string };

async function siteverify(
  token: string,
  remoteIp?: string,
): Promise<TurnstileResult> {
  if (token === "dev-bypass") {
    if (process.env.NODE_ENV !== "production") return { outcome: "ok" };
    return { outcome: "rejected", codes: ["dev-bypass-em-producao"] };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[turnstile] TURNSTILE_SECRET_KEY ausente — pulando verificação em dev.",
      );
      return { outcome: "ok" };
    }
    throw new Error("TURNSTILE_SECRET_KEY ausente em produção.");
  }

  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SITEVERIFY_TIMEOUT_MS);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      return { outcome: "unreachable", reason: `http-${res.status}` };
    }
    const data = (await res.json()) as SiteverifyResponse;
    if (data.success === true) return { outcome: "ok" };
    return { outcome: "rejected", codes: data["error-codes"] ?? [] };
  } catch (err) {
    const reason = err instanceof Error ? err.name : "fetch-error";
    return { outcome: "unreachable", reason };
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const result = await siteverify(token, remoteIp);
  if (result.outcome === "unreachable" && process.env.NODE_ENV === "production") {
    console.warn(
      `[turnstile] Cloudflare inalcançável (${result.reason}) — liberando cadastro.`,
    );
  }
  return result;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  return (await siteverify(token, remoteIp)).outcome === "ok";
}
