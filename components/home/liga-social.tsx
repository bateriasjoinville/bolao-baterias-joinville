import Link from "next/link";

import { TricolorStripe } from "./stripe";

const AZUL_GRADIENTE = "linear-gradient(160deg, #2323e8 0%, #13136e 100%)";

const TAGS = ["Do trabalho", "Da família", "Do bairro"];

export function LigaSocial() {
  return (
    <section className="px-4 py-5">
      <div
        className="overflow-hidden rounded-2xl text-white"
        style={{ background: AZUL_GRADIENTE }}
      >
        <TricolorStripe />
        <div className="px-5 py-6">
          <h2 className="text-xl font-extrabold leading-tight">
            Crie sua liga e dispute com quem você conhece
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            Chame a galera do trabalho, a família ou a turma do bairro pra um
            ranking só de vocês. De graça e leva 1 minuto.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-brand-green px-2.5 py-1 text-xs font-semibold text-white"
              >
                {t}
              </span>
            ))}
          </div>
          <Link
            href="/ligas"
            className="mt-5 block rounded-xl bg-brand-yellow py-3 text-center text-sm font-bold text-brand-blue-dark transition-transform active:scale-[0.98]"
          >
            Ver as ligas →
          </Link>
        </div>
      </div>
    </section>
  );
}
