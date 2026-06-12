import { AdminNav } from "@/components/admin/admin-nav";
import { InstagramTools } from "@/components/admin/instagram-tools";
import {
  atsLine,
  getTop10ForInstagram,
} from "@/lib/admin/instagram-top10";
import { requireAdmin } from "@/lib/admin/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Top 10 / Instagram — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminInstagramPage() {
  await requireAdmin();

  const admin = getSupabaseAdmin();
  const entries = await getTop10ForInstagram(admin);
  const ats = atsLine(entries);
  const comArroba = entries.filter((e) => e.instagram).length;

  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-2xl bg-slate-50">
        <AdminNav
          current="instagram"
          title="Admin · Top 10 / Instagram"
          subtitle={`Prévia ao vivo do ranking geral · ${comArroba} com @`}
        />

        <div className="px-4 py-4">
          <InstagramTools ats={ats} />
        </div>

        {entries.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Ninguém pontuou ainda — o Top 10 aparece quando o ranking tiver
            participantes.
          </p>
        ) : (
          <ol className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {entries.map((e) => (
              <li
                key={`${e.posicao}-${e.displayName}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span
                  className={`w-7 text-center text-lg font-extrabold ${
                    e.posicao === 1 ? "text-brand-blue" : "text-slate-400"
                  }`}
                >
                  {e.posicao}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {e.displayName}
                  </p>
                  {e.instagram ? (
                    <p className="truncate text-sm font-medium text-brand-blue">
                      {e.instagram}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-300">—</p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-bold text-slate-700">
                  {e.pontos} pts
                </span>
              </li>
            ))}
          </ol>
        )}

        <p className="px-4 py-4 text-center text-xs text-slate-400">
          A imagem e os @s usam os dados ao vivo de{" "}
          <code className="rounded bg-slate-200 px-1">participant_scores</code> —
          mesma fonte do ranking público.
        </p>
      </main>
    </div>
  );
}
