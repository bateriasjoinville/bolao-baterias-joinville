import { primeiroNome } from "@/lib/dashboard/format";

type PalpitarHeaderProps = {
  nome: string;
  feitos: number;
  total: number;
  mostrarAviso?: boolean;
};

export function PalpitarHeader({
  nome,
  feitos,
  total,
  mostrarAviso = false,
}: PalpitarHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-brand-blue px-4 py-3 text-white">
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
        {feitos} de {total} disponíveis
      </p>
      {mostrarAviso ? (
        <p className="mt-1 text-[11px] leading-snug opacity-75">
          Os jogos do mata-mata abrem para palpite conforme os times se
          classificam.
        </p>
      ) : null}
    </header>
  );
}
