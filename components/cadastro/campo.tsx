import type { ReactNode } from "react";

type CampoProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

export function Campo({ label, htmlFor, error, children }: CampoProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
