import type { Metadata } from "next";
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
  const { next } = await searchParams;

  return (
    <section className="mx-auto mt-6 grid w-full max-w-4xl overflow-hidden rounded-lg border border-ink-200 bg-white md:grid-cols-2 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex flex-col justify-end gap-10 bg-brand-800 p-8 text-brand-50 md:min-h-80 md:p-10 dark:bg-brand-900">
        <div className="flex flex-col gap-3">
          <p className="font-display text-3xl leading-tight font-semibold text-white">{school.name}</p>
          <p className="text-brand-200">Suas aulas, tarefas e flashcards.</p>
        </div>
      </div>
      <div className="flex flex-col gap-6 p-8 md:p-10">
        <h1 className="text-2xl">Entrar</h1>
        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
    </section>
  );
}
