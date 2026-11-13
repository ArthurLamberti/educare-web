import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/password-reset-forms";
import { SchoolNotFound } from "@/components/school-not-found";
import { getSchool } from "@/lib/auth";

export const metadata: Metadata = { title: "Esqueci a senha" };

export default async function ForgotPasswordPage() {
  const school = await getSchool();
  if (!school) return <SchoolNotFound />;
  return (
    <section className="mx-auto mt-6 flex w-full max-w-sm flex-col gap-4">
      <p className="text-sm font-bold tracking-wide text-brand-600 uppercase">{school.name}</p>
      <h1 className="text-2xl">Esqueci a senha</h1>
      <p className="text-sm text-ink-600 dark:text-ink-400">Informe o e-mail que você usa para entrar. Enviamos um link para criar uma nova senha.</p>
      <ForgotPasswordForm scope="user" loginHref="/login" />
    </section>
  );
}
