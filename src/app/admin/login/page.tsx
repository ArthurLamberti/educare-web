import type { Metadata } from "next";
import Link from "next/link";

import { OperatorLoginForm } from "@/components/operator-login-form";

export const metadata: Metadata = { title: "Operador" };

export default async function OperatorLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { expired, reset } = await searchParams;
  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-bold">Painel do operador</h1>
      <p className="text-sm text-ink-600 dark:text-ink-400">Para a equipe da Educare liberar e suspender espaços.</p>
      {expired && <p className="text-sm text-pen">Sua sessão terminou. Entre de novo.</p>}
      {reset === "1" && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Senha salva. Entre com a nova senha.
        </p>
      )}
      <OperatorLoginForm />
      <Link href="/admin/forgot-password" className="text-sm font-bold text-brand-600 hover:underline">
        Esqueci a senha (ou primeiro acesso)
      </Link>
    </section>
  );
}
