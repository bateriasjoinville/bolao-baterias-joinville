import { Trophy } from "lucide-react";

export function Brinde() {
  return (
    <section className="px-4 pt-7 pb-2">
      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div
          className="w-1.5 shrink-0"
          style={{
            background: "linear-gradient(180deg, #009739 0 50%, #ffd400 50% 100%)",
          }}
        />
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-blue-dark">
            <Trophy size={20} strokeWidth={2.5} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">
              Bateria Moura 60Ah · 1º lugar do ranking geral
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              Retirada na loja em Joinville. Sem dinheiro, sem pegadinha.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
