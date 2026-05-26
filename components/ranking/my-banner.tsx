import Link from "next/link";

import { type RankingEntry } from "@/lib/ranking/queries";
import { type Ranked } from "@/lib/ranking/rank";

type BannerProps = {
  entry: Ranked<RankingEntry> | null;
  contexto: "geral" | "semana";
};

export function MyBanner({ entry, contexto }: BannerProps) {
  if (entry) {
    return (
      <div className="bg-brand-blue px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">
              Você está em
            </p>
            <p className="text-2xl font-extrabold">
              {entry.posicao}º{" "}
              <span className="text-sm font-medium opacity-90">
                · {entry.placaresExatos} exatos · {entry.vencedoresAcertados} vencedores
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-brand-yellow">
              {entry.pontos}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide opacity-80">
              pts
            </p>
          </div>
        </div>
      </div>
    );
  }

  const copy =
    contexto === "semana"
      ? "Você não pontuou nessa semana."
      : "Você ainda não pontuou.";

  return (
    <div className="bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{copy}</p>
        <Link
          href="/palpitar"
          className="text-sm font-semibold text-brand-blue hover:underline"
        >
          Fazer palpites →
        </Link>
      </div>
    </div>
  );
}
