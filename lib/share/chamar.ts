import { CHAMAR_AMIGOS_TEXT } from "@/lib/share/messages";

export async function compartilharChamarAmigos(): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ text: CHAMAR_AMIGOS_TEXT });
      return;
    } catch {
      // usuário cancelou ou share indisponível → não força fallback
      return;
    }
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(CHAMAR_AMIGOS_TEXT)}`;
  window.open(wa, "_blank", "noopener,noreferrer");
}
