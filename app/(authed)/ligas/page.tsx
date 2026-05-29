import Link from "next/link";

import {
  aggregateLigaStats,
  getMinhasLigas,
  type LigaStats,
} from "@/lib/leagues/queries";
import { type MeuPapel } from "@/lib/leagues/types";
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

export default async function LigasPage() {
  await createAuthedServerClient(); // garante sessão; redireciona pra /entrar se não
  const session = await getSession();
  const myId = session.participantId!;

  // Admin pra listagem (RLS de league_members não permite ver pendentes via embed).
  const admin = getSupabaseAdmin();
  const ligas = await getMinhasLigas(admin, myId);
  const ownedIds = ligas
    .filter((l) => l.meuPapel === "owner")
    .map((l) => l.id);
  const stats =
    ownedIds.length > 0
      ? await aggregateLigaStats(admin, ownedIds)
      : new Map<string, LigaStats>();

  const ordenadas = [...ligas].sort((a, b) => {
    const rank = (l: (typeof ligas)[number]) =>
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
        <p className="mt-1 text-xs opacity-85">{ligas.length} de 20 ligas</p>
      </header>

      <section className="mx-4 mt-4 grid grid-cols-2 gap-2">
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
      </section>

      {ligas.length === 0 ? (
        <section className="mx-4 mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Você ainda não participa de nenhuma liga.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Cria uma do zero ou entra em uma com o código de convite.
          </p>
        </section>
      ) : (
        <ul className="mx-4 mt-4 space-y-2">
          {ordenadas.map((l) => {
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
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                        {labelPapel(l.meuPapel)}
                      </p>
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
    </>
  );
}
