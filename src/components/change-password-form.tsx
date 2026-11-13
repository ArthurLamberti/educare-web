"use client";

import { useActionState } from "react";

import { changePassword, type ChangePasswordState } from "@/app/session-actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ChangePasswordState, FormData>(changePassword, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage message={state.message} />
      <Field label="Senha atual" error={state.errors?.currentPassword}>
        <input name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <Field label="Nova senha" error={state.errors?.newPassword}>
        <input name="newPassword" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </Field>
      <Field label="Confirme a nova senha" error={state.errors?.confirmPassword}>
        <input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
