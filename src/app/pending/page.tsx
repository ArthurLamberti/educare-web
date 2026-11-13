import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { logout } from "@/app/session-actions";
import { placeWord, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Acesso ao espaço" };

/**
 * Where every page leads while the space is not active (PENDING or SUSPENDED). Later this is where
 * a private teacher will pay to activate the space.
 */
export default async function PendingPage() {
  const user = await requireUser(undefined, { allowInactive: true });
  if (user.tenant.status === "ACTIVE") redirect("/");
  const place = placeWord(user.tenant.kind);
  const article = place === "espaço" ? "Seu" : "Sua";
  const suspended = user.tenant.status === "SUSPENDED";

  return (
    <section className="flex max-w-xl flex-col items-start gap-4">
      <p className="text-sm font-bold tracking-wide text-brand-600 uppercase">{user.tenant.name}</p>
      {suspended ? (
        <>
          <h1 className="text-3xl">
            {article} {place} está {place === "espaço" ? "suspenso" : "suspensa"}
          </h1>
          <p className="text-ink-700 dark:text-ink-300">
            Enquanto isso, ninguém consegue usar a Educare por aqui. Os dados continuam guardados. Fale com a equipe da Educare para reativar.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl">Quase lá, {user.name.split(" ")[0]}!</h1>
          <p className="text-ink-700 dark:text-ink-300">
            Seu e-mail está confirmado. Agora a equipe da Educare confere o cadastro e libera o seu espaço. Avisamos por e-mail ({user.email})
            assim que estiver pronto.
          </p>
          <p className="text-sm text-ink-500">Quando estiver liberado, “Verificar de novo” leva você direto ao início para cadastrar alunos, agendar aulas e passar tarefas.</p>
        </>
      )}
      <div className="flex items-center gap-4">
        <a href="/pending" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500">
          Verificar de novo
        </a>
        <form action={logout}>
          <button type="submit" className="text-sm font-bold text-ink-600 hover:underline dark:text-ink-300">
            Sair
          </button>
        </form>
      </div>
    </section>
  );
}
