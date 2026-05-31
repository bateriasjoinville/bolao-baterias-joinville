export type Plataforma = "ios" | "android" | "outro";

export function detectarPlataforma(): Plataforma {
  if (typeof navigator === "undefined") return "outro";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "outro";
}

// Roda como app instalado (standalone / adicionado à tela inicial)?
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mql = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;
  return Boolean(mql || iosStandalone);
}
