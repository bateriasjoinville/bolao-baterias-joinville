import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getLigaPorCodigo,
  getMeuStatusNaLiga,
} from "@/lib/leagues/queries";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createAuthedServerClient } from "@/lib/supabase/server";

import { PedirEntradaButton } from "./pedir-button";

export const metadata = {
  title: "Convite — Bolão Copa 2026",
};

export const dynamic = "force-dynamic";

const CODIGO_REGEX = /^[A-Z0-9]{6,10}$/;

export default async function LandingConvitePage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  await createAuthedServerClient(); // garante sessão; redireciona se não
  const { codigo: raw } = await params;
  const codigo = raw.toUpperCase();

  if (!CODIGO_REGEX.test(codigo)) {
    return <ErrorView mensagem="Código inválido." />;
  }

  const admin = getSupabaseAdmin();
  const liga = await getLigaPorCodigo(admin, codigo);
  if (!liga) {
    return <ErrorView mensagem="Liga não encontrada." />;
  }

  const session = await getSession();
  const myId = session.participantId!;

  // Já é owner ou já tem qualquer membership → vai direto pra liga
  if (liga.ownerId === myId) {
    redirect(`/ligas/${liga.id}`);
  }
  const status = await getMeuStatusNaLiga(admin, liga.id, myId);
  if (status !== null) {
    redirect(`/ligas/${liga.id}`);
  }

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
          <p className="text-sm font-semibold">Convite pra liga</p>
        </div>
      </header>

      <section className="mx-4 mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Você foi convidado pra
        </p>
        <h2 className="mt-1 text-xl font-extrabold text-slate-900">
          {liga.nome}
        </h2>
        {liga.descricao ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {liga.descricao}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-slate-500">
          Organizador:{" "}
          <span className="font-semibold text-slate-700">
            {liga.ownerNome}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {liga.countAprovados}{" "}
          {liga.countAprovados === 1
            ? "membro aprovado"
            : "membros aprovados"}
        </p>
      </section>

      <section className="mx-4 mt-4">
        <PedirEntradaButton codigo={codigo} />
        <p className="mt-2 text-center text-xs text-slate-500">
          Depois de pedir, espera o organizador aprovar.
        </p>
      </section>
    </>
  );
}

function ErrorView({ mensagem }: { mensagem: string }) {
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
          <p className="text-sm font-semibold">Convite pra liga</p>
        </div>
      </header>
      <section className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">{mensagem}</p>
        <p className="mt-1 text-xs text-red-600">
          Confere o link com quem te mandou ou digita manualmente em /ligas/entrar.
        </p>
      </section>
    </>
  );
}
