import Link from "next/link";

import { logout } from "@/app/session-actions";
import { getCurrentUser, getSchool, type Role } from "@/lib/auth";
import { countToGrade } from "@/lib/assignments";
import { countPendingRequests } from "@/lib/reschedule-requests";

const NAV: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/teachers", label: "Teachers" },
    { href: "/students", label: "Students" },
    { href: "/lessons", label: "Lessons" },
    { href: "/requests", label: "Requests" },
    { href: "/assignments", label: "Assignments" },
  ],
  TEACHER: [
    { href: "/students", label: "Students" },
    { href: "/lessons", label: "Lessons" },
    { href: "/requests", label: "Requests" },
    { href: "/tasks", label: "Tasks" },
    { href: "/assignments", label: "Assignments" },
    { href: "/grading", label: "To grade" },
  ],
  STUDENT: [
    { href: "/lessons", label: "Lessons" },
    { href: "/assignments", label: "Assignments" },
    { href: "/requests", label: "My requests" },
  ],
};

/** Session-dependent part of the header; rendered inside <Suspense> so the shell stays static. */
export async function AppHeader() {
  const [school, user] = await Promise.all([getSchool(), getCurrentUser()]);
  // Teachers see how many requests wait for their decision and how much work waits for a grade.
  const isTeacher = user?.role === "TEACHER" && !user.mustChangePassword;
  const [pending, toGrade] = isTeacher ? await Promise.all([countPendingRequests(), countToGrade()]) : [0, 0];
  const counters: Record<string, number> = { "/requests": pending, "/grading": toGrade };

  return (
    <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
      <Link href="/" className="text-lg font-bold text-indigo-600">
        Educare
      </Link>
      {school && <span className="text-sm text-zinc-500">{school.name}</span>}
      {user &&
        !user.mustChangePassword &&
        NAV[user.role].map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-1.5 text-sm font-medium hover:text-indigo-600">
            {item.label}
            {(counters[item.href] ?? 0) > 0 && (
              <span aria-label={`${counters[item.href]} pending`} className="rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-white">
                {counters[item.href]}
              </span>
            )}
          </Link>
        ))}
      {user && (
        <details className="relative ml-auto">
          <summary className="cursor-pointer list-none text-sm font-medium hover:text-indigo-600">
            {user.name} ▾
          </summary>
          <div className="absolute right-0 z-10 mt-2 flex w-48 flex-col rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <span className="px-3 py-2 text-xs text-zinc-500">{user.email}</span>
            <Link href="/change-password" className="px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Change password
            </Link>
            <form action={logout}>
              <button type="submit" className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Log out
              </button>
            </form>
          </div>
        </details>
      )}
    </nav>
  );
}

export function AppHeaderFallback() {
  return (
    <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
      <span className="text-lg font-bold text-indigo-600">Educare</span>
    </nav>
  );
}
