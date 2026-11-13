import Link from "next/link";

import { LessonCancelButton } from "@/components/lesson-cancel-button";
import type { Role } from "@/lib/auth";
import { formatDateTime, formatDay, formatTime } from "@/lib/datetime";
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
          <h2 className="text-sm font-semibold text-zinc-500">{day}</h2>
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {items.map((lesson) => (
              <li key={lesson.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 text-sm">
                <span className="w-28 font-mono tabular-nums">
                  {formatTime(lesson.startsAt, timeZone)}–{formatTime(lesson.endsAt, timeZone)}
                </span>
                <span className="min-w-40 flex-1 font-medium">
                  {lesson.topic}
                  {lesson.status === "CANCELED" && <span className="ml-2 text-xs font-normal text-red-600">(canceled)</span>}
                  {lesson.status === "SCHEDULED" && pendingLessonIds.includes(lesson.id) && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Change requested
                    </span>
                  )}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">{otherParty(lesson, role)}</span>
                {actions && role === "STUDENT" && lesson.status === "SCHEDULED" && !pendingLessonIds.includes(lesson.id) && (
                  <StudentAction lesson={lesson} timeZone={timeZone} now={now} />
                )}
                {actions && role === "TEACHER" && lesson.status === "SCHEDULED" && (
                  <span className="ml-auto flex gap-4">
                    <Link href={`/lessons/${lesson.id}/edit`} className="font-medium text-indigo-600 hover:underline">
                      Edit
                    </Link>
                    <LessonCancelButton id={lesson.id} label={`${lesson.topic} – ${lesson.studentName}`} />
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
        <span aria-disabled="true" className="cursor-not-allowed text-sm font-medium text-zinc-400">
          Request new time
        </span>
        <span className="max-w-72 text-xs text-zinc-500">
          Changes must be requested at least 2 days before the lesson (deadline: {formatDateTime(deadline.toISOString(), timeZone)})
        </span>
      </span>
    );
  }
  return (
    <Link href={`/lessons/${lesson.id}/request-change`} className="ml-auto text-sm font-medium text-indigo-600 hover:underline">
      Request new time
    </Link>
  );
}

function otherParty(lesson: Lesson, role: Role) {
  if (role === "TEACHER") return lesson.studentName;
  if (role === "STUDENT") return `with ${lesson.teacherName}`;
  return `${lesson.teacherName} → ${lesson.studentName}`;
}
