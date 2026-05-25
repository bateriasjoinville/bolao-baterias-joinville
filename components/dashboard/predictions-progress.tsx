import Link from "next/link";

type PredictionsProgressProps = {
  feitos: number;
  total: number;
  aberto: boolean;
};

export function PredictionsProgress({
  feitos,
  total,
  aberto,
}: PredictionsProgressProps) {
  const pct = total > 0 ? Math.min(100, (feitos / total) * 100) : 0;

  return (
    <section className="mx-4 mt-4 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Seus palpites
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">
        <span className="text-2xl font-extrabold text-brand-blue">{feitos}</span>{" "}
        de {total} jogos
      </p>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={feitos}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-brand-blue transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4">
        {aberto ? (
          <Link
            href="/palpitar"
            className="block rounded-md bg-brand-blue py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover"
          >
            Palpitar agora
          </Link>
        ) : (
          <Link
            href="/palpitar"
            className="block rounded-md border border-slate-300 bg-white py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Ver jogos →
          </Link>
        )}
      </div>
      {!aberto && (
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Palpites abrem em breve
        </p>
      )}
    </section>
  );
}
