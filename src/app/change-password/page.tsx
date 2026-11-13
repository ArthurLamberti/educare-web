import type { Metadata } from "next";
import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/change-password-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Alterar senha" };

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<p className="text-ink-500">Carregando...</p>}>
      <ChangePassword />
    </Suspense>
  );
}

async function ChangePassword() {
  const user = await requireUser(undefined, { allowPasswordChange: true, allowInactive: true });
  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Alterar senha</h1>
        {user.mustChangePassword && (
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">
            Você está usando uma senha temporária. Escolha uma nova para continuar.
          </p>
        )}
      </div>
      <ChangePasswordForm />
    </section>
  );
}
