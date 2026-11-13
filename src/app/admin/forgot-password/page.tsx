import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/password-reset-forms";

export const metadata: Metadata = { title: "Esqueci a senha" };

export default function AdminForgotPasswordPage() {
  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-bold">Esqueci a senha</h1>
      <p className="text-sm text-ink-600 dark:text-ink-400">
        Informe o e-mail do administrador. Enviamos um link para criar a senha (também serve para o primeiro acesso).
      </p>
      <ForgotPasswordForm scope="admin" loginHref="/admin/login" />
    </section>
  );
}
