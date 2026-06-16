export function PontuacaoCard() {
  return (
    <section className="px-4 pb-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Como pontua
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500">Placar exato</p>
            <p className="mt-1 text-2xl font-extrabold leading-none text-slate-900">
              6 <span className="text-sm font-medium text-slate-500">pts</span>
            </p>
            <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-brand-green">
              <span>⚡</span> 12 pts no Brasil
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Vencedor ou empate</p>
            <p className="mt-1 text-2xl font-extrabold leading-none text-slate-900">
              3 <span className="text-sm font-medium text-slate-500">pts</span>
            </p>
            <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-brand-green">
              <span>⚡</span> 6 pts no Brasil
            </p>
          </div>
        </div>
        <p className="mt-3 border-t border-slate-200 pt-3 text-xs font-medium text-brand-green-dark">
          Todo jogo do Brasil vale o dobro de pontos.
        </p>
      </div>
    </section>
  );
}
