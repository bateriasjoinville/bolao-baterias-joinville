import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "bolao_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/palpitar",
  "/perfil",
  "/ligas",
  "/confirmar-whatsapp",
];
const AUTH_PREFIXES = ["/entrar", "/cadastrar"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const isAuthPage = AUTH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isAuthPage && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|flags/|manifest.webmanifest|sw.js|icons/).*)",
  ],
};
