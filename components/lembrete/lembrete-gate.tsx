import { getPopupLembrete } from "@/lib/config/app-config";
import { contarJogosPendentes48h } from "@/lib/dashboard/jogos-pendentes";
import { createAuthedServerClient } from "@/lib/supabase/server";

import { LembretePalpiteModal } from "./lembrete-palpite-modal";

// Decide server-side se o lembrete deve existir nesta render:
// só quando ligado no admin E a pessoa tem jogo pendente nas próximas 48h.
// O modal client cuida da frequência (localStorage). Sem jogo pendente,
// nada é renderizado — o pop-up some sozinho.
export async function LembreteGate() {
  const config = await getPopupLembrete();
  if (!config.enabled) return null;

  const supabase = await createAuthedServerClient();
  const pendentes = await contarJogosPendentes48h(supabase);
  if (pendentes === 0) return null;

  return (
    <LembretePalpiteModal
      titulo={config.titulo}
      mensagem={config.mensagem}
      version={config.version}
    />
  );
}
