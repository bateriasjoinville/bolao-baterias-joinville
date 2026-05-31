import { TricolorStripe } from "./stripe";

const AZUL_GRADIENTE = "linear-gradient(160deg, #2323e8 0%, #13136e 100%)";

export function FinalCta() {
  return (
    <>
      <section
        className="relative overflow-hidden text-center text-white"
        style={{ background: AZUL_GRADIENTE }}
      >
        <TricolorStripe />
        <div className="px-4 py-8">
          <p className="flex items-center justify-center gap-2 text-xl font-extrabold">
            Bora pra cima!
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/flags/br.svg"
              alt=""
              width={20}
              height={14}
              className="inline-block rounded-sm border border-black/10 object-cover"
            />
          </p>
          <p className="mt-1.5 text-sm text-white/85">
            A Copa começa em 11 de junho. É grátis e só pela diversão.
          </p>
          <a
            href="/cadastrar"
            className="mt-5 block rounded-xl bg-brand-yellow py-4 text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98]"
          >
            Cadastrar grátis →
          </a>
        </div>
      </section>

      <footer className="bg-slate-50 px-4 py-5 text-center text-[11px] leading-relaxed text-slate-500">
        <p>Baterias Joinville · Rua Dona Francisca, 4523</p>
        <p>WhatsApp (47) 99680-1100</p>
        <p className="mt-1">
          <a href="/regulamento" className="underline">
            Regulamento
          </a>{" "}
          ·{" "}
          <a href="/privacidade" className="underline">
            Privacidade
          </a>
        </p>
      </footer>
    </>
  );
}
