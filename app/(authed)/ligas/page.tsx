import Link from "next/link";

import {
  aggregateLigaStats,
  getMinhasLigas,
  getTotalLigasCriadas,
  type LigaResumo,
  type LigaStats,
} from "@/lib/leagues/queries";
import { LIGA_TIPO, type MeuPapel } from "@/lib/leagues/types";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createAuthedServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Minhas ligas — Bolão Copa 2026",
};

export const dynamic = "force-dynamic";

function labelPapel(p: MeuPapel): string {
  if (p === "owner") return "Organizador";
  if (p === "aprovado") return "Membro";
  return "Aguardando aprovação";
}

function subtituloOficial(l: LigaResumo): string {
  return l.tipo === LIGA_TIPO.GERAL
    ? "Todo mundo do bolão"
    : "Liga do seu bairro";
}

export default async function LigasPage() {
  await createAuthedServerClient(); // garante sessão; redireciona pra /entrar se não
  const session = await getSession();
  const myId = session.participantId!;

  // Admin pra listagem (RLS de league_members não permite ver pendentes via embed).
  const admin = getSupabaseAdmin();
  const todas = await getMinhasLigas(admin, myId);
  const oficiais = todas.filter((l) => l.isOficial);
  const minhas = todas.filter((l) => !l.isOficial);

  const ownedIds = minhas
    .filter((l) => l.meuPapel === "owner")
    .map((l) => l.id);
  const statsIds = [...ownedIds, ...oficiais.map((l) => l.id)];
  const stats =
    statsIds.length > 0
      ? await aggregateLigaStats(admin, statsIds)
      : new Map<string, LigaStats>();

  const totalLigas =
    minhas.length === 0 ? await getTotalLigasCriadas(admin) : 0;

  const oficiaisOrd = [...oficiais].sort((a, b) => {
    const rank = (l: LigaResumo) => (l.tipo === LIGA_TIPO.GERAL ? 0 : 1);
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  const minhasOrd = [...minhas].sort((a, b) => {
    const rank = (l: LigaResumo) =>
      l.meuPapel === "owner" ? 0 : l.meuPapel === "aprovado" ? 1 : 2;
    const diff = rank(a) - rank(b);
    if (diff !== 0) return diff;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  return (
    <>
      <header className="sticky top-0 z-10 bg-brand-blue px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Voltar pro Dashboard"
            className="text-sm font-semibold opacity-90"
          >
            ←
          </Link>
          <p className="text-sm font-semibold">Minhas ligas</p>
        </div>
        <p className="mt-1 text-xs opacity-85">{minhas.length} de 20 ligas</p>
      </header>

      {oficiaisOrd.length > 0 ? (
        <section className="mx-4 mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Ligas oficiais
          </p>
          <ul className="mt-2 space-y-2">
            {oficiaisOrd.map((l) => {
              const total = stats.get(l.id)?.countAprovados ?? 0;
              return (
                <li key={l.id}>
                  <Link
                    href={`/ligas/${l.id}`}
                    className="block rounded-lg border border-slate-200 bg-brand-blue-soft p-3 transition-colors hover:border-brand-blue"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {l.nome}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {subtituloOficial(l)}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-brand-blue px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Oficial
                      </span>
                    </div>
                    {total > 0 ? (
                      <p className="mt-2 text-xs text-slate-500">
                        {total} {total === 1 ? "participante" : "participantes"}
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mx-4 mt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Minhas ligas
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Link
            href="/ligas/criar"
            className="block rounded-md bg-brand-blue py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover"
          >
            Criar liga
          </Link>
          <Link
            href="/ligas/entrar"
            className="block rounded-md border border-slate-300 bg-white py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Entrar em liga
          </Link>
        </div>

        {minhas.length === 0 ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-6 text-center">
            <p className="text-lg font-extrabold text-slate-900">
              Competir com amigos é muito melhor
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Crie uma liga e chame a galera do trabalho, da família ou da
              resenha pra disputar um ranking só de vocês. É de graça e leva 1
              minuto.
            </p>
            {totalLigas > 0 ? (
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-yellow-soft px-3 py-1 text-xs font-bold text-brand-blue-dark">
                🏆 Já {totalLigas === 1 ? "tem" : "são"} {totalLigas}{" "}
                {totalLigas === 1 ? "liga criada" : "ligas criadas"}
              </p>
            ) : null}
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {minhasOrd.map((l) => {
              const pendentes =
                l.meuPapel === "owner"
                  ? (stats.get(l.id)?.countPendentes ?? 0)
                  : 0;
              return (
                <li key={l.id}>
                  <Link
                    href={`/ligas/${l.id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">
                          {l.nome}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500">
                            {labelPapel(l.meuPapel)}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              l.isPublica
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {l.isPublica ? "Pública" : "Privada"}
                          </span>
                        </div>
                      </div>
                      {pendentes > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                          {pendentes} pendente{pendentes === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                    {l.descricao ? (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                        {l.descricao}
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
