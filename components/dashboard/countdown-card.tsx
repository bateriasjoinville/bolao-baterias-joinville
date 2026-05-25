type CountdownCardProps = {
  dias: number;
};

export function CountdownCard({ dias }: CountdownCardProps) {
  if (dias <= 0) return null;

  return (
    <section className="mx-4 mt-4 rounded-lg bg-brand-yellow px-5 py-6 text-center text-brand-blue-dark">
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
        Faltam
      </p>
      <p className="mt-1 text-8xl font-extrabold leading-none">{dias}</p>
      <p className="mt-2 text-base font-semibold">
        {dias === 1 ? "dia" : "dias"}
      </p>
      <p className="mt-3 text-xs opacity-70">
        11 de junho · 1º jogo da Copa
      </p>
    </section>
  );
}
