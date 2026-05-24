import type { ReactNode } from "react";

type AceiteCheckboxProps = {
  id: string;
  name: string;
  defaultChecked?: boolean;
  error?: string;
  children: ReactNode;
};

export function AceiteCheckbox({
  id,
  name,
  defaultChecked,
  error,
  children,
}: AceiteCheckboxProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-slate-700"
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-400 text-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
        <span>{children}</span>
      </label>
      {error ? (
        <p className="mt-1 ml-8 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
