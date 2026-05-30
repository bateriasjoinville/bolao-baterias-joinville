type CountdownCardProps = {
  dias: number;
};

export function CountdownCard({ dias }: CountdownCardProps) {
  if (dias <= 0) return null;

  return (
    <section className="mx-4 mt-4 flex items-center gap-4 rounded-lg bg-brand-yellow px-5 py-4 text-brand-blue-dark">
      <p className="text-5xl font-extrabold leading-none">{dias}</p>
      <div className="leading-tight">
        <p className="text-sm font-semibold">
          {dias === 1 ? "dia" : "dias"} pro 1º jogo da Copa
        </p>
        <p className="text-xs opacity-70">11 de junho</p>
      </div>
    </section>
  );
}
