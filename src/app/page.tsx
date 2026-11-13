import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-3xl font-bold">Bem-vindo ao Educare</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Gerencie os alunos cadastrados na plataforma.</p>
      <Link href="/alunos" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
        Ver alunos
      </Link>
    </section>
  );
}
