"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAdmin, type AdminLoginState } from "@/app/admin/auth/actions";

const INITIAL_STATE: AdminLoginState = {};

export function AdminAuthForm() {
  const [state, formAction] = useActionState(loginAdmin, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4 px-4 py-5">
      {state.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <label htmlFor="token" className="block text-sm font-semibold text-slate-700">
        Token de administrador
        <input
          id="token"
          name="token"
          type="password"
          autoComplete="off"
          autoFocus
          required
          className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-3 text-base text-slate-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
        />
      </label>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="block w-full rounded-xl bg-brand-yellow py-4 text-base font-bold text-brand-blue-dark transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}
