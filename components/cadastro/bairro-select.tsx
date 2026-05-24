import { BAIRROS_OPCOES } from "@/lib/validation/bairros";

type BairroSelectProps = {
  id: string;
  name: string;
  defaultValue?: string;
  ariaInvalid?: boolean;
};

export function BairroSelect({
  id,
  name,
  defaultValue,
  ariaInvalid,
}: BairroSelectProps) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue ?? ""}
      aria-invalid={ariaInvalid}
      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
      required
    >
      <option value="" disabled>
        Selecione seu bairro
      </option>
      {BAIRROS_OPCOES.map((bairro) => (
        <option key={bairro} value={bairro}>
          {bairro}
        </option>
      ))}
    </select>
  );
}
