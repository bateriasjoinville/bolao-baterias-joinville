import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { ConfrontoMini } from "@/components/admin/confronto-mini";
import { getPalpitesPorJogador } from "@/lib/admin/predictions";
import { requireAdmin } from "@/lib/admin/session";
import { formatCPF, formatWhatsApp } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Cadastro — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCadastroPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const admin = getSupabaseAdmin();
  const data = await getPalpitesPorJogador(admin, id, new Date().toISOString());
  if (!data) notFound();

  const { participante: p, palpites } = data;
  const local = `${p.cidade}/${p.estado}${p.bairro ? ` · ${p.bairro}` : ""}`;
  const totalPts = palpites.reduce((acc, x) => acc + (x.pontos ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-2xl bg-slate-50">
        <AdminNav
          current="cadastrados"
          title="Admin · Cadastro"
          subtitle={p.nome}
        />

        <div className="border-b border-slate-200 bg-white px-3 py-3">
          <Link
            href="/admin/cadastrados"
            className="text-xs font-medium text-brand-blue hover:underline"
          >
            ← Voltar pros cadastrados
          </Link>
        </div>

        <div className="space-y-4 px-3 py-4">
          <section className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
            <p className="text-base font-bold text-slate-900">{p.nome}</p>
            <dl className="mt-2 grid grid-cols-1 gap-1 text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="inline font-medium text-slate-500">CPF: </dt>
                <dd className="inline font-mono">{formatCPF(p.cpf)}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-slate-500">WhatsApp: </dt>
                <dd className="inline font-mono">{formatWhatsApp(p.whatsapp)}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-slate-500">Local: </dt>
                <dd className="inline">{local}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-slate-500">Instagram: </dt>
                <dd className="inline">{p.instagram ? `@${p.instagram}` : "—"}</dd>
              </div>
            </dl>
            <a
              href={`https://wa.me/55${p.whatsapp}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
            >
              Abrir WhatsApp →
            </a>
          </section>

          <section>
            <h2 className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-extrabold text-slate-800">
                Palpites em jogos travados
              </span>
              {palpites.length > 0 ? (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  {totalPts} pts · {palpites.length}{" "}
                  {palpites.length === 1 ? "jogo" : "jogos"}
                </span>
              ) : null}
            </h2>

            {palpites.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                Nenhum palpite em jogo já travado. Palpites de jogos abertos
                ficam ocultos até 1h antes do início.
              </p>
            ) : (
              <ul className="space-y-2">
                {palpites.map((x) => (
                  <li key={x.match.id} className="space-y-1.5">
                    <ConfrontoMini match={x.match} />
                    <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-600">
                        Palpite:{" "}
                        <span className="font-mono font-bold text-slate-900">
                          {x.palpiteA} × {x.palpiteB}
                        </span>
                      </span>
                      {x.pontos != null ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            x.exato
                              ? "bg-emerald-100 text-emerald-700"
                              : x.pontos > 0
                                ? "bg-blue-100 text-brand-blue"
                                : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {x.exato ? "Cravou! " : ""}
                          {x.pontos} pts
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                          aguardando resultado
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
