import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { countPendentes } from "@/lib/admin/help-requests";
import { countParticipants } from "@/lib/admin/participants";
import { countJogosHoje } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin — Início",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
      <div className="text-2xl font-extrabold text-brand-blue">{value}</div>
      <div className="mt-0.5 text-xs font-semibold text-slate-600">{label}</div>
      {hint ? <div className="text-[11px] text-slate-400">{hint}</div> : null}
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
  badge,
}: {
  href: string;
  title: string;
  desc: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm hover:bg-slate-50"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900">{title}</span>
          {badge && badge > 0 ? (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
      </div>
      <span aria-hidden className="text-xl text-slate-300">
        →
      </span>
    </Link>
  );
}

export default async function AdminHomePage() {
  await requireAdmin();

  const admin = getSupabaseAdmin();
  const nowISO = new Date().toISOString();
  const [cadastrados, jogosHoje, pedidos] = await Promise.all([
    countParticipants(admin),
    countJogosHoje(admin, nowISO),
    countPendentes(admin),
  ]);

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-2xl bg-slate-50">
        <AdminNav current="inicio" title="Admin · Início" subtitle="Painel do bolão" />

        <section className="grid grid-cols-3 gap-2 px-3 py-4">
          <Stat label="Cadastrados" value={cadastrados} />
          <Stat
            label="Jogos hoje"
            value={jogosHoje.total}
            hint={
              jogosHoje.total === 0
                ? "nenhum hoje"
                : `${jogosHoje.semPlacar} sem placar`
            }
          />
          <Stat label="Pedidos" value={pedidos} hint="pendentes" />
        </section>

        <section className="space-y-3 px-3 pb-10">
          <NavCard
            href="/admin/placares"
            title="Placares"
            desc="Lançar resultados dos jogos"
          />
          <NavCard
            href="/admin/cadastrados"
            title="Cadastrados"
            desc="Lista de inscritos e exportar CSV"
          />
          <NavCard
            href="/admin/instagram"
            title="Top 10 / Instagram"
            desc="Gerar imagens do ranking e copiar @s"
          />
          <NavCard
            href="/admin/pedidos-ajuda"
            title="Pedidos de ajuda"
            desc="Responder quem pediu ajuda no cadastro"
            badge={pedidos}
          />
        </section>
      </main>
    </div>
  );
}
