import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Acesso negado" };

export default function NotAllowedPage() {
  return (
    <section className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-bold">Você não tem acesso a esta página</h1>
      <p className="text-ink-600 dark:text-ink-400">Sua conta não tem permissão para ver este conteúdo.</p>
      <Link href="/" className="text-sm font-bold text-brand-600 hover:underline">
        Ir para o início
      </Link>
    </section>
  );
}
