"use client";

import { useActionState } from "react";

import { confirmAction, type ConfirmState } from "@/app/confirm/actions";
import { primaryButtonClass } from "@/components/form-field";

export function ConfirmEmailForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ConfirmState, FormData>(confirmAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {state.message && (
        <div role="alert" className="flex flex-col gap-1 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          <span>{state.message}</span>
          <span>Entre com seu e-mail e senha na página de login para receber um link novo.</span>
        </div>
      )}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Confirmando..." : "Confirmar meu e-mail"}
      </button>
    </form>
  );
}
