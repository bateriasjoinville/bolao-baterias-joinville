export function PremiosLista() {
  return (
    <section className="px-4 pb-6">
      <h2 className="text-xl font-bold text-slate-900">Os prêmios</h2>
      <p className="mb-3 text-sm text-slate-600">
        Mais de R$ 5.000 distribuídos em 38 dias de Copa.
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-brand-yellow-soft px-3.5 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-sm font-extrabold text-brand-blue-dark">
            1º
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">
              R$ 1.000 + Bateria Moura 60Ah
            </p>
            <p className="text-xs text-slate-600">Campeão geral</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-b border-slate-200 px-3.5 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
            2º
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">R$ 500</p>
            <p className="text-xs text-slate-600">Vice-campeão</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-b border-slate-200 px-3.5 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
            3º
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">R$ 250</p>
            <p className="text-xs text-slate-600">Terceiro lugar</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-b border-slate-200 px-3.5 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white">
            4-20
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              17 prêmios complementares
            </p>
            <p className="text-xs text-slate-600">
              Lavações, rodízios, potes e mais
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-b border-slate-200 px-3.5 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-blue-dark">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              R$ 100 toda semana
            </p>
            <p className="text-xs text-slate-600">5 semanas, 5 ganhadores</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3.5 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-blue-dark">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M13 2L4.09 12.97 11 14l-2 8 9-12-7-1z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Vale-checkup grátis
            </p>
            <p className="text-xs text-slate-600">
              Cravou placar exato? Bateria + alternador na faixa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
