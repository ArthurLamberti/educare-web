import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";
import { SchoolNotFound } from "@/components/school-not-found";
import { getSchool } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const school = await getSchool();
  if (!school) return <SchoolNotFound />;
  const { next } = await searchParams;

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div>
        <p className="text-sm text-zinc-500">{school.name}</p>
        <h1 className="text-2xl font-bold">Log in</h1>
      </div>
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </section>
  );
}
