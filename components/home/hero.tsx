export function Hero() {
  return (
    <section className="bg-brand-blue px-4 pt-3 pb-8 text-white">
      <p className="mb-2 flex items-center gap-1.5 text-xs opacity-80">
        <span>⚽</span> +R$ 5.000 em prêmios · 11 jun a 19 jul
      </p>
      <h1 className="mb-2 text-3xl leading-[1.05] font-extrabold tracking-tight">
        Bolão da Copa 2026
      </h1>
      <p className="mb-5 text-[15px] leading-relaxed opacity-90">
        Palpita os 104 jogos. Quem mais acerta, leva.
      </p>

      <div className="mb-4 rounded-xl bg-brand-yellow p-4 text-brand-blue-dark">
        <p className="mb-1 text-[10px] font-bold tracking-wider uppercase opacity-70">
          Prêmio principal
        </p>
        <p className="text-[22px] leading-tight font-extrabold">
          R$ 1.000 + Bateria Moura
        </p>
        <p className="mt-1 text-xs opacity-70">Pro 1º lugar do ranking geral</p>
      </div>

      <a
        href="/cadastrar"
        className="block rounded-xl bg-brand-yellow py-4 text-center text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98]"
      >
        Quero participar grátis →
      </a>
      <p className="mt-2.5 text-center text-xs opacity-80">
        Leva 1 minuto. Sem cartão. Sem pegadinha.
      </p>
    </section>
  );
}
