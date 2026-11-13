import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";
import { SchoolNotFound } from "@/components/school-not-found";
import { getSchool } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense fallback={<p className="text-ink-500">Carregando...</p>}>
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const school = await getSchool();
  if (!school) return <SchoolNotFound />;
  const { next, confirmed, reset } = await searchParams;

  return (
    <section className="mx-auto mt-6 grid w-full max-w-4xl overflow-hidden rounded-lg border border-ink-200 bg-white md:grid-cols-2 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex flex-col justify-end gap-10 bg-brand-800 p-8 text-brand-50 md:min-h-80 md:p-10 dark:bg-brand-900">
        <div className="flex flex-col gap-3">
          <p className="font-display text-3xl leading-tight font-semibold text-white">{school.name}</p>
          <p className="text-brand-200">
            {school.kind === "INDIVIDUAL" ? "Seu espaço de aulas, tarefas e flashcards." : "Suas aulas, tarefas e flashcards."}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6 p-8 md:p-10">
        <h1 className="text-2xl">Entrar</h1>
        {confirmed === "1" && (
          <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
            E-mail confirmado. Entre com sua senha.
          </p>
        )}
        {reset === "1" && (
          <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
            Senha alterada. Entre com a nova senha.
          </p>
        )}
        <LoginForm next={typeof next === "string" ? next : undefined} />
        <Link href="/forgot-password" className="text-sm font-bold text-brand-600 hover:underline">
          Esqueci a senha
        </Link>
      </div>
    </section>
  );
}
