import { SITE_URL } from "@/lib/site";

const SITE_DOMINIO = SITE_URL.replace(/^https?:\/\//, "");

export const CHAMAR_AMIGOS_TEXT =
  `⚽ Bora jogar o BOLÃO GRÁTIS da Copa da Baterias Joinville?\n\n` +
  `Palpita os jogos, crie uma liga e chame a galera pra disputar! 👊\n\n` +
  `Como pontua:\n` +
  `🎯 Placar exato = 6 pts\n` +
  `✔️ Acertou o vencedor = 3 pts\n` +
  `🇧🇷 Jogo do Brasil = vale 2x!\n\n` +
  `É de graça e rapidinho 👉\n` +
  `${SITE_DOMINIO}`;

export function mensagemConviteLiga(nomeLiga: string, link: string): string {
  return (
    `🏆 Te chamei pra minha liga no BOLÃO GRÁTIS da Baterias Joinville!\n\n` +
    `Entra na liga "${nomeLiga}" e bora disputar quem manda mais nos palpites da Copa! 👊\n\n` +
    `Como pontua:\n` +
    `🎯 Placar exato = 6 pts\n` +
    `✔️ Acertou o vencedor = 3 pts\n` +
    `🇧🇷 Jogo do Brasil = vale 2x!\n\n` +
    `Entra aqui 👇\n` +
    `${link}`
  );
}
