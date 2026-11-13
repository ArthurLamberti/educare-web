import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/password-reset-forms";

export const metadata: Metadata = { title: "Nova senha" };

export default async function AdminResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
  const { token } = await searchParams;
  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-bold">Criar nova senha</h1>
      {typeof token === "string" && token ? (
        <ResetPasswordForm scope="admin" token={token} forgotHref="/admin/forgot-password" />
      ) : (
        <p className="text-ink-600 dark:text-ink-400">
          Link incompleto.{" "}
          <Link href="/admin/forgot-password" className="font-bold text-brand-600 hover:underline">
            Peça um novo
          </Link>
          .
        </p>
      )}
    </section>
  );
}
