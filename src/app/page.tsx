import Link from "next/link";
import { Suspense } from "react";

import { Landing } from "@/components/landing";
import { LessonList } from "@/components/lesson-list";
import { countToGrade, listAssignments } from "@/lib/assignments";
import { requireUser, type Role, type User } from "@/lib/auth";
import { listLessons } from "@/lib/lessons";
import { toReviewToday } from "@/lib/flashcards";
import { getStudentProgress } from "@/lib/reviews";
import { countPendingRequests } from "@/lib/reschedule-requests";
import { getTenantSlug } from "@/lib/tenant";

const SHORTCUTS: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/teachers/new", label: "Cadastrar professor" },
    { href: "/teachers", label: "Professores" },
    { href: "/students", label: "Alunos" },
    { href: "/lessons", label: "Todas as aulas" },
  ],
  TEACHER: [
    { href: "/lessons/new", label: "Agendar aula" },
    { href: "/students/new", label: "Cadastrar aluno" },
    { href: "/tasks/new", label: "Escrever tarefa" },
    { href: "/flashcards", label: "Cadastrar palavras" },
  ],
  STUDENT: [],
};

type Todo = { href: string; count: number; one: string; many: string };

export default function Home() {
  return (
    <Suspense fallback={<p className="text-ink-500">Carregando...</p>}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  if (!(await getTenantSlug())) return <Landing />;
  const user = await requireUser();
  const today = new Intl.DateTimeFormat("pt-BR", { timeZone: user.tenant.timeZone, weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-1">
        <p className="text-ink-500">{today}</p>
        <h1 className="text-4xl">Olá, {user.name.split(" ")[0]}</h1>
        <p className="text-ink-600 dark:text-ink-400">{user.tenant.name}</p>
      </section>

      <div className="grid gap-10 md:grid-cols-[1fr_16rem]">
        <div className="flex flex-col gap-10">
          {user.role !== "ADMIN" && (
            <Suspense fallback={null}>
              <Todos role={user.role} />
            </Suspense>
          )}
          {user.role !== "ADMIN" && <NextLessons user={user} />}
          {user.role === "ADMIN" && (
            <p className="max-w-prose text-ink-600 dark:text-ink-400">
              Cadastre os professores da escola; cada professor cadastra seus alunos, aulas, tarefas e flashcards.
            </p>
          )}
        </div>
        {SHORTCUTS[user.role].length > 0 && (
          <nav aria-label="Atalhos" className="flex flex-col gap-2 self-start md:border-l md:border-ink-200 md:pl-6 dark:md:border-ink-800">
            <h2 className="mb-1 text-lg">Começar algo</h2>
            {SHORTCUTS[user.role].map((s, i) => (
              <Link
                key={s.href}
                href={s.href}
                className={
                  i === 0
                    ? "rounded-md bg-brand-600 px-4 py-2 text-center font-bold text-white hover:bg-brand-500"
                    : "rounded-md px-1 py-1 font-bold text-brand-700 hover:underline dark:text-brand-300"
                }
              >
                {s.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

/** What is waiting for this person right now, highest first. */
async function Todos({ role }: { role: Role }) {
  const todos: Todo[] =
    role === "TEACHER"
      ? await Promise.all([countToGrade(), countPendingRequests()]).then(([grade, requests]) => [
          { href: "/grading", count: grade, one: "resposta para corrigir", many: "respostas para corrigir" },
          { href: "/requests", count: requests, one: "pedido de remarcação para decidir", many: "pedidos de remarcação para decidir" },
        ])
      : await Promise.all([getStudentProgress(), listAssignments({ statuses: ["ASSIGNED"], size: 1 })]).then(([progress, todo]) => [
          {
            href: "/study",
            count: toReviewToday(progress),
            one: "flashcard para revisar hoje",
            many: "flashcards para revisar hoje",
          },
          { href: "/assignments", count: todo.totalElements, one: "tarefa para responder", many: "tarefas para responder" },
        ]);
  const open = todos.filter((t) => t.count > 0);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl">Esperando por você</h2>
      {open.length === 0 ? (
        <p className="text-ink-600 dark:text-ink-400">Nada por enquanto. Está tudo em dia.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {open.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group flex items-center gap-4 rounded-md border border-ink-200 bg-white px-4 py-3 hover:border-brand-500 dark:border-ink-800 dark:bg-ink-900"
              >
                <span className="min-w-10 rounded-sm bg-highlight px-2 py-0.5 text-center text-lg font-bold text-ink-900 tabular-nums">{t.count}</span>
                <span className="font-bold">{t.count === 1 ? t.one : t.many}</span>
                <span className="ml-auto text-sm text-brand-700 group-hover:underline dark:text-brand-300">Abrir</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Next 5 scheduled lessons of a teacher or student. */
async function NextLessons({ user }: { user: User }) {
  const lessons = await listLessons({ from: new Date(), status: "SCHEDULED", size: 5 });
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl">Próximas aulas</h2>
        <Link href="/lessons" className="text-sm font-bold text-brand-700 hover:underline dark:text-brand-300">
          Todas as aulas
        </Link>
      </div>
      {lessons.content.length === 0 ? (
        <p className="text-ink-600 dark:text-ink-400">
          Nenhuma aula agendada.
          {user.role === "TEACHER" && (
            <>
              {" "}
              <Link href="/lessons/new" className="font-bold text-brand-700 hover:underline dark:text-brand-300">
                Agendar uma
              </Link>
            </>
          )}
        </p>
      ) : (
        <LessonList lessons={lessons.content} role={user.role} timeZone={user.tenant.timeZone} />
      )}
    </section>
  );
}
