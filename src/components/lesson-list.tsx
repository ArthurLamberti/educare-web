import Link from "next/link";

import { EndSeriesButton } from "@/components/end-series-button";
import { LessonCancelButton } from "@/components/lesson-cancel-button";
import type { Role } from "@/lib/auth";
import { formatDateTime, formatDay, formatTime, instantToZonedParts } from "@/lib/datetime";
import type { Lesson } from "@/lib/lessons";

/** Mirrors the API's 48-hour rule for change requests (display only). */
const MIN_NOTICE_MS = 48 * 60 * 60 * 1000;

type Props = {
  lessons: Lesson[];
  role: Role;
  timeZone: string;
  /** Edit/Cancel (teacher) or Request new time (student) on scheduled lessons. */
  actions?: boolean;
  /** Lessons with a pending change request get a badge. */
  pendingLessonIds?: number[];
  /** Server "now" (ms) for the request deadline. */
  now?: number;
};

/** Lessons grouped by day in the school's time zone. */
export function LessonList({ lessons, role, timeZone, actions = false, pendingLessonIds = [], now = 0 }: Props) {
  const days = new Map<string, Lesson[]>();
  for (const lesson of lessons) {
    const day = formatDay(lesson.startsAt, timeZone);
    days.set(day, [...(days.get(day) ?? []), lesson]);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...days].map(([day, items]) => (
        <div key={day} className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-ink-500">{day}</h3>
          <ul className="divide-y divide-ink-200 rounded-md border border-ink-200 bg-white dark:divide-ink-800 dark:bg-ink-900 dark:border-ink-800">
            {items.map((lesson) => (
              <li key={lesson.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 text-sm">
                <span className="w-28 font-bold tabular-nums">
                  {formatTime(lesson.startsAt, timeZone)}–{formatTime(lesson.endsAt, timeZone)}
                </span>
                <span className="min-w-40 flex-1 font-bold">
                  {lesson.topic}
                  {lesson.seriesId !== null && (
                    <span title="Aula de uma série semanal" className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      ↻ Semanal
                    </span>
                  )}
                  {lesson.status === "CANCELED" && <span className="ml-2 text-xs font-normal text-red-600">(cancelada)</span>}
                  {lesson.status === "SCHEDULED" && pendingLessonIds.includes(lesson.id) && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Remarcação pedida
                    </span>
                  )}
                </span>
                <span className="text-ink-600 dark:text-ink-400">{otherParty(lesson, role)}</span>
                {actions && role === "STUDENT" && lesson.status === "SCHEDULED" && !pendingLessonIds.includes(lesson.id) && (
                  <StudentAction lesson={lesson} timeZone={timeZone} now={now} />
                )}
                {actions && role === "TEACHER" && lesson.status === "SCHEDULED" && (
                  <span className="ml-auto flex gap-4">
                    <Link href={`/lessons/${lesson.id}/edit`} className="font-bold text-brand-600 hover:underline">
                      Editar
                    </Link>
                    <LessonCancelButton id={lesson.id} label={`${lesson.topic} – ${lesson.studentName}`} />
                    {lesson.seriesId !== null && (
                      <EndSeriesButton
                        seriesId={lesson.seriesId}
                        from={instantToZonedParts(lesson.startsAt, timeZone).date}
                        label="Encerrar série"
                        confirmText={`Encerrar as aulas semanais de ${lesson.studentName}? Esta aula (${formatDateTime(lesson.startsAt, timeZone)}) e todas as próximas da série serão canceladas.`}
                      />
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function StudentAction({ lesson, timeZone, now }: { lesson: Lesson; timeZone: string; now: number }) {
  const deadline = new Date(new Date(lesson.startsAt).getTime() - MIN_NOTICE_MS);
  if (now > deadline.getTime()) {
    return (
      <span className="ml-auto flex flex-col items-end text-right">
        <span aria-disabled="true" className="cursor-not-allowed text-sm font-bold text-ink-400">
          Pedir novo horário
        </span>
        <span className="max-w-72 text-xs text-ink-500">
          Mudanças precisam ser pedidas com pelo menos 2 dias de antecedência (prazo: {formatDateTime(deadline.toISOString(), timeZone)})
        </span>
      </span>
    );
  }
  return (
    <Link href={`/lessons/${lesson.id}/request-change`} className="ml-auto text-sm font-bold text-brand-600 hover:underline">
      Pedir novo horário
    </Link>
  );
}

function otherParty(lesson: Lesson, role: Role) {
  if (role === "TEACHER") return lesson.studentName;
  if (role === "STUDENT") return `com ${lesson.teacherName}`;
  return `${lesson.teacherName} → ${lesson.studentName}`;
}
