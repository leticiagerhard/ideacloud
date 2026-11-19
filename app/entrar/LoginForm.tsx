"use client";

import { useActionState } from "react";
import { entrar, type EntrarState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<EntrarState, FormData>(entrar, {});

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <label htmlFor="senha" className="text-sm font-semibold text-ink-soft">
        Senha
      </label>
      <input
        id="senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        className="min-h-14 rounded-2xl border border-line bg-paper px-4 text-ink shadow-soft placeholder:text-ink-soft/60"
        placeholder="Sua senha"
      />
      {state.error && (
        <p role="alert" className="text-sm font-semibold text-peach-500">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-14 rounded-full bg-sage-600 px-6 text-lg font-bold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
