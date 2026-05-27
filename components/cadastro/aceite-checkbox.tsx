import type { ReactNode } from "react";

type AceiteCheckboxProps = {
  id: string;
  name: string;
  defaultChecked?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
};

export function AceiteCheckbox({
  id,
  name,
  defaultChecked,
  error,
  helperText,
  children,
}: AceiteCheckboxProps) {
  const hintId = helperText ? `hint-${id}` : undefined;
  const erroId = error ? `erro-${id}` : undefined;
  const describedBy = [hintId, erroId].filter(Boolean).join(" ") || undefined;

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
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-400 text-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
        <span>{children}</span>
      </label>
      {helperText ? (
        <p id={hintId} className="mt-1 ml-8 text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p
          id={erroId}
          role="alert"
          className="mt-1 ml-8 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
