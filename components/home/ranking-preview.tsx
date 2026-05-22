export function RankingPreview() {
  return (
    <section className="px-4 pb-6">
      <h2 className="mb-3 text-xl font-bold text-slate-900">
        Quem tá ganhando
      </h2>
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-7 text-center">
        <p className="mb-2 text-2xl">🏆</p>
        <p className="mb-1 text-base font-bold text-slate-900">
          Ranking começa em 11 de junho
        </p>
        <p className="text-sm leading-snug text-slate-600">
          Quem cadastrar até lá palpita desde o 1º jogo.
        </p>
      </div>
      <p className="mt-2.5 text-center text-xs text-slate-500">
        Cadastros abertos. Bolão gratuito. Você pode entrar até o fim da Copa.
      </p>
    </section>
  );
}
