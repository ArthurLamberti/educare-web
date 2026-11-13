"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/session-actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage message={state.message} />
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="E-mail">
        <input name="email" type="email" required autoComplete="username" defaultValue={state.email} key={state.email} className={inputClass} />
      </Field>
      <Field label="Senha">
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
