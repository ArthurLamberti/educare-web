"use client";

import Link from "next/link";
import { useActionState } from "react";

import { forgotPasswordAction, resetPasswordAction, type ForgotPasswordState, type ResetPasswordState } from "@/app/password-actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";
import type { PasswordScope } from "@/lib/password";

/** Asks for the email; the answer is the same whether or not the account exists. */
export function ForgotPasswordForm({ scope, loginHref }: { scope: PasswordScope; loginHref: string }) {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(forgotPasswordAction.bind(null, scope), {});

  if (state.sent) {
    return (
      <div role="status" className="flex flex-col gap-3">
        <p className="text-ink-700 dark:text-ink-300">
          Se houver uma conta com <strong>{state.email}</strong>, enviamos um link para criar uma nova senha. Ele vale por 1 hora.
        </p>
        <p className="text-sm text-ink-500">Não chegou? Veja a caixa de spam ou confira se este é o e-mail que você usa para entrar.</p>
        <Link href={loginHref} className="text-sm font-bold text-brand-600 hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormMessage message={state.message} />
      <Field label="E-mail">
        <input name="email" type="email" required autoComplete="username" defaultValue={state.email} className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Enviando..." : "Enviar link"}
      </button>
      <Link href={loginHref} className="text-sm font-bold text-brand-600 hover:underline">
        Voltar para o login
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ scope, token, forgotHref }: { scope: PasswordScope; token: string; forgotHref: string }) {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(resetPasswordAction.bind(null, scope, token), {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormMessage message={state.message} />
      {state.message && (
        <Link href={forgotHref} className="text-sm font-bold text-brand-600 hover:underline">
          Pedir um novo link
        </Link>
      )}
      <Field label="Nova senha" error={state.errors?.newPassword}>
        <input name="newPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} />
      </Field>
      <Field label="Confirme a nova senha" error={state.errors?.confirmPassword}>
        <input name="confirmPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
