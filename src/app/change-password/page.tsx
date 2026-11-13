import type { Metadata } from "next";
import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/change-password-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Change password" };

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
      <ChangePassword />
    </Suspense>
  );
}

async function ChangePassword() {
  const user = await requireUser(undefined, { allowPasswordChange: true });
  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Change password</h1>
        {user.mustChangePassword && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            You are using a temporary password. Choose a new one to continue.
          </p>
        )}
      </div>
      <ChangePasswordForm />
    </section>
  );
}
