import { microcopyAberturaPalpites } from "@/lib/dashboard/format";

export function BannerPreCopa() {
  const titulo = microcopyAberturaPalpites() ?? "Palpites ainda não abriram";
  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
      <p className="font-semibold">{titulo}</p>
      <p className="mt-0.5 leading-snug">
        Você pode navegar pelos jogos, mas ainda não dá pra palpitar.
      </p>
    </div>
  );
}
