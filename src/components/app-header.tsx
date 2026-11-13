import Link from "next/link";

import { NavLink } from "@/components/nav-link";
import { logout } from "@/app/session-actions";
import { canEditSettings, getCurrentUser, getSchool, type Role } from "@/lib/auth";
import { countToGrade } from "@/lib/assignments";
import { countPendingRequests } from "@/lib/reschedule-requests";

const NAV: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/teachers", label: "Professores" },
    { href: "/students", label: "Alunos" },
    { href: "/lessons", label: "Aulas" },
    { href: "/requests", label: "Solicitações" },
    { href: "/assignments", label: "Atividades" },
    { href: "/flashcards", label: "Flashcards" },
  ],
  TEACHER: [
    { href: "/students", label: "Alunos" },
    { href: "/lessons", label: "Aulas" },
    { href: "/requests", label: "Solicitações" },
    { href: "/tasks", label: "Tarefas" },
    { href: "/assignments", label: "Atividades" },
    { href: "/grading", label: "Para corrigir" },
    { href: "/flashcards", label: "Flashcards" },
  ],
  STUDENT: [
    { href: "/lessons", label: "Aulas" },
    { href: "/assignments", label: "Atividades" },
    { href: "/flashcards", label: "Flashcards" },
    { href: "/requests", label: "Meus pedidos" },
  ],
};

/** Session-dependent part of the header; rendered inside <Suspense> so the shell stays static. */
export async function AppHeader() {
  const [school, user] = await Promise.all([getSchool(), getCurrentUser()]);
  // The menu only makes sense in an active space (otherwise every page leads to /pending).
  const usable = user && !user.mustChangePassword && user.tenant.status === "ACTIVE";
  // Teachers see how many requests wait for their decision and how much work waits for a grade.
  const isTeacher = usable && user.role === "TEACHER";
  const [pending, toGrade] = isTeacher ? await Promise.all([countPendingRequests(), countToGrade()]) : [0, 0];
  const counters: Record<string, number> = { "/requests": pending, "/grading": toGrade };

  return (
    <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
      <Wordmark school={school?.name} />
      {usable && (
        <div className="order-last flex w-full gap-5 overflow-x-auto sm:order-none sm:w-auto">
          {NAV[user.role].map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} count={counters[item.href] ?? 0} />
          ))}
        </div>
      )}
      {user && (
        <details className="relative ml-auto">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-brand-100 hover:text-white">
            <span aria-hidden className="grid size-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {initials(user.name)}
            </span>
            <span className="hidden md:inline">{user.name}</span>
          </summary>
          <div className="absolute right-0 z-10 mt-2 flex w-56 flex-col rounded-md border border-ink-200 bg-white py-1 text-sm text-ink-900 shadow-lg dark:border-ink-800 dark:bg-ink-900 dark:text-ink-100">
            <span className="px-3 pt-2 font-bold">{user.name}</span>
            <span className="px-3 pb-2 text-xs text-ink-500">{user.email}</span>
            {usable && canEditSettings(user) && (
              <Link href="/settings" className="border-t border-ink-100 px-3 py-2 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800">
                Configurações
              </Link>
            )}
            <Link href="/change-password" className="border-t border-ink-100 px-3 py-2 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800">
              Alterar senha
            </Link>
            <form action={logout}>
              <button type="submit" className="w-full px-3 py-2 text-left hover:bg-ink-50 dark:hover:bg-ink-800">
                Sair
              </button>
            </form>
          </div>
        </details>
      )}
    </nav>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function Wordmark({ school }: { school?: string }) {
  return (
    <Link href="/" className="flex items-baseline gap-3">
      <span className="font-display text-xl font-semibold tracking-tight text-white">Educare</span>
      {school && <span className="hidden text-sm text-brand-200 sm:inline">{school}</span>}
    </Link>
  );
}

export function AppHeaderFallback() {
  return (
    <nav className="mx-auto flex max-w-5xl items-center px-6 py-3">
      <Wordmark />
    </nav>
  );
}
