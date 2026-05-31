import { Countdown } from "./countdown";
import { TricolorStripe } from "./stripe";

const AZUL_GRADIENTE = "linear-gradient(160deg, #2323e8 0%, #13136e 100%)";

export function Hero({ kickoffISO }: { kickoffISO: string | null }) {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: AZUL_GRADIENTE }}
    >
      <TricolorStripe />

      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 top-28 h-56 w-56 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(0,151,57,0.45), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(0,151,57,0.32), transparent 70%)",
        }}
      />

      <div className="relative px-4 pb-9 pt-3">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-brand-yellow px-2.5 py-1 text-xs font-bold tracking-tight text-brand-blue-dark">
            Baterias Joinville
          </span>
          <a href="/entrar" className="text-sm font-medium text-white/90">
            Entrar →
          </a>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
            ⚽ 104 jogos
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green px-2.5 py-1 text-xs font-semibold text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/flags/br.svg"
              alt=""
              width={16}
              height={11}
              className="inline-block rounded-[2px] border border-black/10 object-cover"
            />
            Brasil vale 2x
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-green px-2.5 py-1 text-xs font-semibold text-white">
            🎉 só diversão
          </span>
        </div>

        <h1 className="mt-4 text-[34px] font-extrabold leading-[1.05] tracking-tight">
          Bolão da Copa 2026
        </h1>

        <div className="mt-3 inline-flex items-center rounded-full bg-brand-yellow px-3 py-1 text-sm font-extrabold tracking-wide text-brand-blue-dark">
          100% GRÁTIS
        </div>

        <p className="mt-3 text-[15px] leading-relaxed text-white/90">
          Palpita os jogos, dispute com a galera e suba no ranking. Quem mais
          acerta, leva.
        </p>

        <p
          className="mt-4 rounded-lg px-3 py-2 text-[13px] font-medium text-emerald-50"
          style={{ backgroundColor: "rgba(0,151,57,0.22)" }}
        >
          🎉 De graça, só pela diversão — sem aposta, sem dinheiro envolvido.
        </p>

        <Countdown kickoffISO={kickoffISO} />

        <a
          href="/cadastrar"
          className="mt-6 block rounded-xl bg-brand-yellow py-4 text-center text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98]"
        >
          Quero participar grátis →
        </a>
        <p className="mt-2.5 text-center text-xs text-white/80">
          Leva 1 minuto · Sem cartão · Sem pegadinha
        </p>
      </div>
    </section>
  );
}
