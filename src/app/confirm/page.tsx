import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ConfirmEmailForm } from "@/components/confirm-email-form";
import { SchoolNotFound } from "@/components/school-not-found";
import { getSchool } from "@/lib/auth";

export const metadata: Metadata = { title: "Confirmar e-mail" };

/** Opened from the sign-up email, on the new space's address. */
export default function ConfirmPage({ searchParams }: PageProps<"/confirm">) {
  return (
    <Suspense fallback={<p className="text-ink-500">Carregando...</p>}>
      <Confirm searchParams={searchParams} />
    </Suspense>
  );
}

async function Confirm({ searchParams }: Pick<PageProps<"/confirm">, "searchParams">) {
  const [school, { token }] = await Promise.all([getSchool(), searchParams]);
  if (!school) return <SchoolNotFound />;

  return (
    <section className="mx-auto mt-6 flex w-full max-w-md flex-col gap-5 rounded-lg border border-ink-200 bg-white p-8 dark:border-ink-800 dark:bg-ink-900">
      <h1 className="text-2xl">Confirmar e-mail</h1>
      {typeof token === "string" && token ? (
        <>
          <p className="text-ink-700 dark:text-ink-300">
            Falta só um passo para usar <strong>{school.name}</strong>.
          </p>
          <ConfirmEmailForm token={token} />
        </>
      ) : (
        <p className="text-ink-700 dark:text-ink-300">
          Este link está incompleto. Abra o link do e-mail de novo ou{" "}
          <Link href="/login" className="font-bold text-brand-600 hover:underline">
            entre
          </Link>{" "}
          para receber outro.
        </p>
      )}
    </section>
  );
}
