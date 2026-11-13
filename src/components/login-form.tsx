"use client";

import { useActionState, useState, useTransition } from "react";

import { login, resendFromLogin, type LoginState } from "@/app/session-actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage message={state.message} />
      {state.unconfirmed && state.email && <Unconfirmed email={state.email} key={state.email} />}
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

function Unconfirmed({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string>();

  return (
    <div role="alert" className="flex flex-col gap-2 rounded-md bg-highlight/30 px-3 py-2 text-sm">
      <span>
        Confirme seu e-mail antes de entrar: abra o link que enviamos para <strong>{email}</strong>.
      </span>
      {result ? (
        <span>{result}</span>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => setResult(await resendFromLogin(email)))}
          className="self-start font-bold text-brand-700 hover:underline disabled:opacity-50 dark:text-brand-300"
        >
          {pending ? "Enviando..." : "Reenviar link"}
        </button>
      )}
    </div>
  );
}
