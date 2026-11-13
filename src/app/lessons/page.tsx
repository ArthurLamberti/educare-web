import type { Metadata } from "next";
import Link from "next/link";

import { EndSeriesButton } from "@/components/end-series-button";
import { LessonFilters } from "@/components/lesson-filters";
import { LessonList } from "@/components/lesson-list";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { listLessons, listSeries, type LessonQuery, type LessonSeries } from "@/lib/lessons";
import { WEEKDAYS } from "@/lib/weekdays";
import { lessonsWithPendingRequest } from "@/lib/reschedule-requests";
import { listStudents } from "@/lib/students";
import { listTeachers } from "@/lib/teachers";

export const metadata: Metadata = { title: "Aulas" };

const PAGE_SIZE = 20;

const VIEWS = {
  upcoming: { label: "Próximas", empty: "Nenhuma aula agendada." },
  past: { label: "Anteriores", empty: "Nenhuma aula anterior." },
  canceled: { label: "Canceladas", empty: "Nenhuma aula cancelada." },
} as const;

type View = keyof typeof VIEWS;

export default async function LessonsPage({ searchParams }: PageProps<"/lessons">) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const isTeacher = user.role === "TEACHER";
  const { view: rawView, page, created, n, teacherId, studentId } = await searchParams;
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

  const [lessons, teachers, students, pendingLessonIds, series] = await Promise.all([
    listLessons({ ...query, ...filters, page: pageNumber, size: PAGE_SIZE }),
    isAdmin ? listTeachers(0, 200) : null,
    isAdmin ? listStudents(0, 200, { includeInactive: true }) : null,
    view === "upcoming" ? lessonsWithPendingRequest() : [],
    view === "upcoming" ? listSeries() : [],
  ]);
  const shownSeries = series.filter(
    (s) => (!filters.teacherId || s.teacherId === filters.teacherId) && (!filters.studentId || s.studentId === filters.studentId),
  );

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
        <h1 className="text-2xl font-bold">Aulas</h1>
        {isTeacher && (
          <Link href="/lessons/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500">
            Nova aula
          </Link>
        )}
      </div>

      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          {created === "series" ? `Aulas semanais criadas: ${Number(n) || 0} aulas nas próximas 8 semanas.` : "Aula agendada."}
        </p>
      )}

      <nav className="flex gap-1 border-b border-ink-200 text-sm dark:border-ink-800">
        {(Object.keys(VIEWS) as View[]).map((v) => (
          <Link
            key={v}
            href={link({ view: v })}
            aria-current={v === view ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2 font-bold ${
              v === view ? "border-brand-600 text-brand-600" : "border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
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

      {shownSeries.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg">Aulas semanais</h2>
          <ul className="divide-y divide-ink-200 rounded-md border border-ink-200 bg-white dark:divide-ink-800 dark:border-ink-800 dark:bg-ink-900">
            {shownSeries.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 text-sm">
                <span className="w-48 font-bold">{seriesWhen(s)}</span>
                <span className="min-w-40 flex-1 font-bold">{s.topic}</span>
                <span className="text-ink-600 dark:text-ink-400">
                  {user.role === "TEACHER" ? s.studentName : user.role === "STUDENT" ? `com ${s.teacherName}` : `${s.teacherName} → ${s.studentName}`}
                </span>
                <span className="text-xs text-ink-500">
                  {s.nextLessonAt ? `próxima: ${formatDateTime(s.nextLessonAt, user.tenant.timeZone)}` : "sem próximas aulas"}
                </span>
                {isTeacher && (
                  <span className="ml-auto">
                    <EndSeriesButton
                      seriesId={s.id}
                      label="Encerrar"
                      confirmText={`Encerrar as aulas semanais de ${s.studentName} (${seriesWhen(s)})? Todas as próximas aulas da série serão canceladas.`}
                    />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-ink-500">Horários no fuso da escola ({user.tenant.timeZone.replaceAll("_", " ")}).</p>

      {lessons.content.length === 0 ? (
        <p className="text-ink-500">{VIEWS[view].empty}</p>
      ) : (
        <LessonList
          lessons={lessons.content}
          role={user.role}
          timeZone={user.tenant.timeZone}
          actions={!isAdmin && view === "upcoming"}
          pendingLessonIds={pendingLessonIds}
          now={now.getTime()}
        />
      )}

      {lessons.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">
            Página {lessons.number + 1} de {lessons.totalPages} · {lessons.totalElements} aulas
          </span>
          <div className="flex gap-2">
            {lessons.number > 0 && <Link href={link({ page: String(lessons.number - 1) })} className="hover:underline">← Anterior</Link>}
            {lessons.number + 1 < lessons.totalPages && <Link href={link({ page: String(lessons.number + 1) })} className="hover:underline">Próxima →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}

/** e.g. "Ter e Qui às 14:00 · 1h" */
function seriesWhen(series: LessonSeries) {
  const days = WEEKDAYS.filter(([day]) => series.weekdays.includes(day)).map(([, label]) => label);
  const list = days.length > 1 ? `${days.slice(0, -1).join(", ")} e ${days.at(-1)}` : days[0];
  const h = Math.floor(series.durationMinutes / 60);
  const m = series.durationMinutes % 60;
  const duration = [h && `${h}h`, m && `${m}min`].filter(Boolean).join(" ");
  return `${list} às ${series.startTime.slice(0, 5)} · ${duration}`;
}
