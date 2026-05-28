const PASSOS = [
  {
    titulo: "Cadastra em 1 minuto",
    descricao: "Nome, CPF, WhatsApp e bairro. Só Joinville e Pirabeiraba.",
  },
  {
    titulo: "Palpita os 104 jogos",
    descricao: "Até 1h antes de cada jogo. Edita quantas vezes quiser.",
  },
  {
    titulo: "Acerta mais, sobe no ranking",
    descricao: "Placar exato vale 6. Jogo do Brasil vale o dobro.",
  },
];

export function ComoFunciona() {
  return (
    <section className="px-4 py-6">
      <h2 className="mb-4 text-xl font-bold text-slate-900">Como funciona</h2>
      <div className="space-y-4">
        {PASSOS.map((passo, i) => (
          <div key={passo.titulo} className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
              {i + 1}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-slate-900">
                {passo.titulo}
              </p>
              <p className="mt-0.5 text-sm leading-snug text-slate-600">
                {passo.descricao}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
