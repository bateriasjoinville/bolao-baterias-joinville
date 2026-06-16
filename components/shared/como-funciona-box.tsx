export function ComoFuncionaBox() {
  return (
    <section className="px-4 py-3">
      <div className="overflow-hidden rounded-xl border border-brand-blue/20 bg-brand-blue-soft">
        <div className="flex h-1.5 w-full">
          <div className="flex-1 bg-brand-green" />
          <div className="flex-1 bg-brand-yellow" />
        </div>
        <div className="px-4 py-3">
          <p className="text-sm font-bold text-brand-blue-dark">
            ℹ️ Como funciona
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Você pode editar o palpite até 1h antes de cada jogo.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-brand-green px-2.5 py-1 text-[11px] font-bold text-white">
              🎯 Placar exato: 6pts
            </span>
            <span className="rounded-full bg-brand-blue px-2.5 py-1 text-[11px] font-bold text-white">
              ✔️ Vencedor ou empate 3pts
            </span>
            <span className="rounded-full bg-brand-yellow px-2.5 py-1 text-[11px] font-bold text-brand-blue-dark">
              🇧🇷 Jogo do Brasil vale o Dobro
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
