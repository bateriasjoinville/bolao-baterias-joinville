export function FinalCta() {
  return (
    <>
      <section className="bg-brand-blue px-4 py-7 text-center text-white">
        <p className="mb-1 flex items-center justify-center gap-2 text-xl font-extrabold">
          Bora pra cima
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/flags/br.svg"
            alt=""
            width={20}
            height={14}
            className="inline-block rounded-sm border border-black/10 object-cover"
          />
        </p>
        <p className="mb-4 text-sm opacity-85">A Copa começa em 11 de junho.</p>
        <a
          href="/cadastrar"
          className="block rounded-xl bg-brand-yellow py-4 text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98]"
        >
          Cadastrar grátis
        </a>
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
