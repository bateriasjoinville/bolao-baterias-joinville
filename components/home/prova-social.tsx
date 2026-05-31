// Só aparece com massa crítica — número baixo atrapalha a conversão.
const MINIMO_EXIBIR = 50;

export function ProvaSocial({ total }: { total: number }) {
  if (total < MINIMO_EXIBIR) return null;

  return (
    <section className="px-4 pb-6">
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-4">
        <span className="text-brand-green">⚡</span>
        <p className="text-sm font-semibold text-slate-800">
          Já são {total.toLocaleString("pt-BR")} palpiteiros
        </p>
      </div>
    </section>
  );
}
