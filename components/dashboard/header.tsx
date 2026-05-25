import { diasParaCopa, isPreCopa, primeiroNome } from "@/lib/dashboard/format";

type DashboardHeaderProps = {
  nome: string;
  posicao?: number | null;
  totalParticipantes?: number | null;
  pontos?: number | null;
};

export function DashboardHeader({
  nome,
  posicao,
  totalParticipantes,
  pontos,
}: DashboardHeaderProps) {
  const preCopa = isPreCopa();
  const dias = diasParaCopa();

  return (
    <header className="sticky top-0 z-10 bg-brand-blue px-4 py-3 text-white">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Olá, {primeiroNome(nome)}</p>
        <form action="/sair" method="post">
          <button
            type="submit"
            className="text-xs font-semibold opacity-80 transition-opacity hover:opacity-100"
          >
            Sair
          </button>
        </form>
      </div>
      <p className="mt-1 text-xs opacity-85">
        {preCopa ? (
          <>Bolão começa em {dias} {dias === 1 ? "dia" : "dias"}</>
        ) : (
          <>
            {posicao != null && totalParticipantes != null
              ? `${posicao}º de ${totalParticipantes}`
              : "— de —"}{" "}
            · {pontos != null ? `${pontos} pts` : "— pts"}
          </>
        )}
      </p>
    </header>
  );
}
