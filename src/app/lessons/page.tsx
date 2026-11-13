import type { Metadata } from "next";
import Link from "next/link";

import { LessonFilters } from "@/components/lesson-filters";
import { LessonList } from "@/components/lesson-list";
import { requireUser } from "@/lib/auth";
import { listLessons, type LessonQuery } from "@/lib/lessons";
import { listStudents } from "@/lib/students";
import { listTeachers } from "@/lib/teachers";

export const metadata: Metadata = { title: "Lessons" };

const PAGE_SIZE = 20;

const VIEWS = {
  upcoming: { label: "Upcoming", empty: "No upcoming lessons." },
  past: { label: "Past", empty: "No past lessons." },
  canceled: { label: "Canceled", empty: "No canceled lessons." },
} as const;

type View = keyof typeof VIEWS;

export default async function LessonsPage({ searchParams }: PageProps<"/lessons">) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const isTeacher = user.role === "TEACHER";
  const { view: rawView, page, created, teacherId, studentId } = await searchParams;
  const view: View = typeof rawView === "string" && rawView in VIEWS ? (rawView as View) : "upcoming";
  const pageNumber = Math.max(0, Number(page) || 0);
  const filters = {
    teacherId: isAdmin && Number(teacherId) > 0 ? Number(teacherId) : undefined,
    studentId: isAdmin && Number(studentId) > 0 ? Number(studentId) : undefined,
  };

  const now = new Date();
  const query: LessonQuery = {
    upcoming: { from: now, status: "SCHEDULED" as const },
    past: { to: now, status: "SCHEDULED" as const, descending: true },
    canceled: { status: "CANCELED" as const, descending: true },
  }[view];

  const [lessons, teachers, students] = await Promise.all([
    listLessons({ ...query, ...filters, page: pageNumber, size: PAGE_SIZE }),
    isAdmin ? listTeachers(0, 200) : null,
    isAdmin ? listStudents(0, 200, { includeInactive: true }) : null,
  ]);

  const link = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { view, teacherId: filters.teacherId?.toString(), studentId: filters.studentId?.toString(), ...changes };
    for (const [key, value] of Object.entries(merged)) if (value && !(key === "view" && value === "upcoming")) params.set(key, value);
    const q = params.toString();
    return q ? `/lessons?${q}` : "/lessons";
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lessons</h1>
        {isTeacher && (
          <Link href="/lessons/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            New lesson
          </Link>
        )}
      </div>

      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Lesson scheduled.
        </p>
      )}

      <nav className="flex gap-1 border-b border-zinc-200 text-sm dark:border-zinc-800">
        {(Object.keys(VIEWS) as View[]).map((v) => (
          <Link
            key={v}
            href={link({ view: v })}
            aria-current={v === view ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 font-medium ${
              v === view ? "border-indigo-600 text-indigo-600" : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {VIEWS[v].label}
          </Link>
        ))}
      </nav>

      {isAdmin && teachers && students && (
        <LessonFilters
          teachers={teachers.content.map((t) => ({ id: t.id, name: t.name }))}
          students={students.content.map((s) => ({ id: s.id, name: s.name }))}
        />
      )}

      <p className="text-xs text-zinc-500">Times in the school&apos;s time zone ({user.tenant.timeZone.replaceAll("_", " ")}).</p>

      {lessons.content.length === 0 ? (
        <p className="text-zinc-500">{VIEWS[view].empty}</p>
      ) : (
        <LessonList lessons={lessons.content} role={user.role} timeZone={user.tenant.timeZone} actions={isTeacher && view === "upcoming"} />
      )}

      {lessons.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Page {lessons.number + 1} of {lessons.totalPages} · {lessons.totalElements} lessons
          </span>
          <div className="flex gap-2">
            {lessons.number > 0 && <Link href={link({ page: String(lessons.number - 1) })} className="hover:underline">← Previous</Link>}
            {lessons.number + 1 < lessons.totalPages && <Link href={link({ page: String(lessons.number + 1) })} className="hover:underline">Next →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}
