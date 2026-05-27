import { Trophy } from "lucide-react";

export function PremiosLista() {
  return (
    <section className="px-4 pb-6">
      <h2 className="text-xl font-bold text-slate-900">Brinde cortesia</h2>
      <p className="mb-3 text-sm text-slate-600">
        Pro melhor palpiteiro da Copa. Sem prêmios em dinheiro. Sem pegadinha.
        Só conhecimento de futebol.
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 bg-brand-yellow-soft px-3.5 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-blue-dark">
            <Trophy size={20} strokeWidth={2.5} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">
              1 Bateria Moura 60Ah
            </p>
            <p className="text-xs text-slate-600">
              Pro 1º colocado do ranking geral. Retirada na loja em Joinville/SC.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
