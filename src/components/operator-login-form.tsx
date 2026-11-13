"use client";

import { useActionState } from "react";

import { operatorLogin, type OperatorLoginState } from "@/app/admin/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

export function OperatorLoginForm() {
  const [state, action, pending] = useActionState<OperatorLoginState, FormData>(operatorLogin, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormMessage message={state.message} />
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
