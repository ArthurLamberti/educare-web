import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/password-reset-forms";
import { SchoolNotFound } from "@/components/school-not-found";
import { getSchool } from "@/lib/auth";

export const metadata: Metadata = { title: "Nova senha" };

/** Opened from the email. The token is only used when the form is sent. */
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const school = await getSchool();
  if (!school) return <SchoolNotFound />;
  const { token } = await searchParams;
  return (
    <section className="mx-auto mt-6 flex w-full max-w-sm flex-col gap-4">
      <p className="text-sm font-bold tracking-wide text-brand-600 uppercase">{school.name}</p>
      <h1 className="text-2xl">Criar nova senha</h1>
      {typeof token === "string" && token ? (
        <ResetPasswordForm scope="user" token={token} forgotHref="/forgot-password" />
      ) : (
        <p className="text-ink-600 dark:text-ink-400">
          Link incompleto. Abra o link do e-mail de novo, ou{" "}
          <Link href="/forgot-password" className="font-bold text-brand-600 hover:underline">
            peça um novo
          </Link>
          .
        </p>
      )}
    </section>
  );
}
