"use client";

import { useState } from "react";

import { UFS } from "@/lib/validation/ufs";

import { BairroSelect } from "./bairro-select";
import { Campo } from "./campo";

export type CidadeTipo = "joinville" | "outra";

type LocalizacaoFieldsProps = {
  defaultTipo?: CidadeTipo;
  defaultBairro?: string;
  defaultCidade?: string;
  defaultUf?: string;
  erroBairro?: string;
  erroCidade?: string;
  erroUf?: string;
};

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500";

export function LocalizacaoFields({
  defaultTipo = "joinville",
  defaultBairro,
  defaultCidade,
  defaultUf,
  erroBairro,
  erroCidade,
  erroUf,
}: LocalizacaoFieldsProps) {
  const [tipo, setTipo] = useState<CidadeTipo>(defaultTipo);

  return (
    <div className="space-y-3">
      <span className="block text-sm font-semibold text-slate-800">
        Onde você mora?
      </span>

      <input type="hidden" name="cidade_tipo" value={tipo} readOnly />

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Cidade">
        <Opcao
          ativo={tipo === "joinville"}
          destaque
          onClick={() => setTipo("joinville")}
        >
          Joinville
        </Opcao>
        <Opcao ativo={tipo === "outra"} onClick={() => setTipo("outra")}>
          Outra cidade
        </Opcao>
      </div>

      {tipo === "joinville" ? (
        <Campo label="Bairro" htmlFor="bairro" error={erroBairro}>
          <BairroSelect
            id="bairro"
            name="bairro"
            defaultValue={defaultBairro}
            ariaInvalid={Boolean(erroBairro)}
            ariaDescribedBy={erroBairro ? "erro-bairro" : undefined}
          />
        </Campo>
      ) : (
        <>
          <div className="grid grid-cols-[5.5rem_1fr] gap-2">
            <Campo label="Estado" htmlFor="uf" error={erroUf}>
              <select
                id="uf"
                name="uf"
                defaultValue={defaultUf ?? ""}
                aria-invalid={Boolean(erroUf)}
                aria-describedby={erroUf ? "erro-uf" : undefined}
                className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none aria-invalid:border-red-500"
                required
              >
                <option value="" disabled>
                  UF
                </option>
                {UFS.map((uf) => (
                  <option key={uf.sigla} value={uf.sigla}>
                    {uf.sigla}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Cidade" htmlFor="cidade" error={erroCidade}>
              <input
                id="cidade"
                name="cidade"
                type="text"
                autoComplete="address-level2"
                required
                placeholder="Sua cidade"
                defaultValue={defaultCidade}
                aria-invalid={Boolean(erroCidade)}
                aria-describedby={erroCidade ? "erro-cidade" : undefined}
                className={inputClass}
              />
            </Campo>
          </div>

          <div
            role="note"
            className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900"
          >
            📍 <strong>Atenção:</strong> você concorre normalmente, mas o{" "}
            <strong>brinde cortesia</strong> (Bateria Moura 60Ah) é retirado{" "}
            <strong>presencialmente</strong> na nossa loja em Joinville/SC.
          </div>
        </>
      )}
    </div>
  );
}

function Opcao({
  ativo,
  destaque = false,
  onClick,
  children,
}: {
  ativo: boolean;
  destaque?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const base =
    "rounded-xl border px-3 py-3 text-sm font-bold transition-colors";
  const estado = ativo
    ? "border-brand-blue bg-brand-blue text-white"
    : destaque
      ? "border-brand-blue/40 bg-brand-blue-soft text-brand-blue"
      : "border-slate-300 bg-white text-slate-700";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={ativo}
      onClick={onClick}
      className={`${base} ${estado}`}
    >
      {children}
    </button>
  );
}
