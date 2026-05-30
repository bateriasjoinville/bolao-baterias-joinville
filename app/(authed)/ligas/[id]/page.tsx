import Link from "next/link";
import { notFound } from "next/navigation";

import { Lista } from "@/components/ranking/lista";
import {
  getLigaById,
  getLigaStats,
  getMembrosAprovadosComNomes,
  getMeuStatusNaLiga,
  getPendentes,
} from "@/lib/leagues/queries";
import { getRankingLiga } from "@/lib/leagues/ranking";
import { MEMBRO_STATUS } from "@/lib/leagues/types";
import { assignRanks, rankKey } from "@/lib/ranking/rank";
import { toDisplayName } from "@/lib/scoring/display-name";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createAuthedServerClient } from "@/lib/supabase/server";

import {
  ApagarButton,
  CopyCodeButton,
  MembroPendenteActions,
  RemoverMembroButton,
  SairButton,
  VisibilidadeToggle,
} from "./client";

export const metadata = {
  title: "Liga — Bolão Copa 2026",
};

export const dynamic = "force-dynamic";

export default async function LigaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createAuthedServerClient();
  const session = await getSession();
  const myId = session.participantId!;

  // RLS: owner ou aprovado vê o liga. Pendente recebe null aqui.
  const liga = await getLigaById(supabase, id, myId);

  if (!liga) {
    const status = await getMeuStatusNaLiga(supabase, id, myId);
    if (status === MEMBRO_STATUS.PENDENTE) {
      return <PendingView ligaId={id} />;
    }
    notFound();
  }

  // Autorizado: busca via admin pra evitar restrições de RLS em listagens
  // (intent do schema 0001 — ver comentário antes das policies em league_members).
  const admin = getSupabaseAdmin();
  const isOwner = liga.meuPapel === "owner";

  const [rankingEntries, pendentes, stats, membrosAprovados] =
    await Promise.all([
      getRankingLiga(admin, id),
      isOwner
        ? getPendentes(admin, id)
        : Promise.resolve(
            [] as Awaited<ReturnType<typeof getPendentes>>,
          ),
      getLigaStats(admin, id),
      getMembrosAprovadosComNomes(admin, id),
    ]);

  const ranked = assignRanks(rankingEntries, rankKey);
  const outrosMembros = membrosAprovados.filter(
    (m) => m.participantId !== myId,
  );

  return (
    <>
      <header className="sticky top-0 z-10 bg-brand-blue px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <Link
            href="/ligas"
            aria-label="Voltar pra Minhas ligas"
            className="text-sm font-semibold opacity-90"
          >
            ←
          </Link>
          <p className="truncate text-sm font-semibold">{liga.nome}</p>
        </div>
        <p className="mt-1 text-xs opacity-85">
          {isOwner ? "Você é o organizador" : "Você é membro"} ·{" "}
          {stats.countAprovados}{" "}
          {stats.countAprovados === 1 ? "membro" : "membros"}
        </p>
      </header>

      <section className="mx-4 mt-4 rounded-lg border border-slate-200 bg-white p-4">
        {liga.descricao ? (
          <p className="text-sm leading-relaxed text-slate-700">
            {liga.descricao}
          </p>
        ) : (
          <p className="text-xs italic text-slate-500">Sem descrição.</p>
        )}
        <div className="mt-3 rounded-md bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Código de convite
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="font-mono text-base font-bold tracking-wider text-slate-900">
              {liga.codigoConvite}
            </p>
            <CopyCodeButton codigo={liga.codigoConvite} />
          </div>
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3">
          {isOwner ? (
            <VisibilidadeToggle ligaId={liga.id} isPublica={liga.isPublica} />
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">
                {liga.isPublica ? "Liga pública" : "Liga privada"}
              </p>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  liga.isPublica
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {liga.isPublica ? "Pública" : "Privada"}
              </span>
            </div>
          )}
        </div>
      </section>

      {isOwner && pendentes.length > 0 ? (
        <section className="mx-4 mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-900">
            Pedidos pendentes ({pendentes.length})
          </p>
          <ul className="mt-2 space-y-2">
            {pendentes.map((p) => (
              <li
                key={p.participantId}
                className="flex items-center justify-between gap-2 rounded-md border border-amber-200 bg-white px-3 py-2"
              >
                <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                  {p.nome}
                </p>
                <MembroPendenteActions
                  ligaId={liga.id}
                  participantId={p.participantId}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-4 mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Participantes ({membrosAprovados.length})
        </p>
        <ul className="mt-2 divide-y divide-slate-100">
          {membrosAprovados.map((m) => (
            <li
              key={m.participantId}
              className="flex items-center justify-between gap-2 py-2"
            >
              <p className="min-w-0 truncate text-sm text-slate-900">
                <span className="font-semibold">{toDisplayName(m.nome)}</span>
                {m.participantId === liga.ownerId ? (
                  <span className="ml-1 rounded-md bg-brand-yellow px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-blue-dark">
                    ORGANIZADOR
                  </span>
                ) : null}
                {m.participantId === myId ? (
                  <span className="ml-1 rounded-md bg-brand-blue px-1.5 py-0.5 text-[10px] font-bold text-white">
                    VOCÊ
                  </span>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-4 mt-4 rounded-lg border border-slate-200 bg-white">
        <p className="px-4 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Ranking interno
        </p>
        <Lista entries={ranked} myId={myId} />
      </section>

      {isOwner && outrosMembros.length > 0 ? (
        <section className="mx-4 mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Gerenciar membros
          </p>
          <ul className="mt-2 divide-y divide-slate-100">
            {outrosMembros.map((m) => {
              const display = toDisplayName(m.nome);
              return (
                <li
                  key={m.participantId}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <p className="min-w-0 truncate text-sm text-slate-700">
                    {display}
                  </p>
                  <RemoverMembroButton
                    ligaId={liga.id}
                    participantId={m.participantId}
                    nome={display}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="mx-4 mt-6 mb-4">
        {isOwner ? (
          <ApagarButton ligaId={liga.id} />
        ) : (
          <SairButton ligaId={liga.id} />
        )}
      </section>
    </>
  );
}

async function PendingView({ ligaId }: { ligaId: string }) {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("leagues")
    .select("nome")
    .eq("id", ligaId)
    .maybeSingle();
  const nome = data?.nome ?? "Liga";

  return (
    <>
      <header className="sticky top-0 z-10 bg-brand-blue px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <Link
            href="/ligas"
            aria-label="Voltar pra Minhas ligas"
            className="text-sm font-semibold opacity-90"
          >
            ←
          </Link>
          <p className="truncate text-sm font-semibold">{nome}</p>
        </div>
      </header>
      <section className="mx-4 mt-4 rounded-lg border border-amber-300 bg-amber-50 p-6 text-center">
        <p className="text-sm font-semibold text-amber-900">
          Aguardando aprovação
        </p>
        <p className="mt-2 text-xs leading-relaxed text-amber-800">
          O organizador da liga precisa aprovar seu pedido. Quando aprovar, você
          vê o ranking interno aqui.
        </p>
      </section>
    </>
  );
}
