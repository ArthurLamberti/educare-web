import Link from "next/link";

import { LessonCancelButton } from "@/components/lesson-cancel-button";
import type { Role } from "@/lib/auth";
import { formatDay, formatTime } from "@/lib/datetime";
import type { Lesson } from "@/lib/lessons";

/** Lessons grouped by day in the school's time zone. `actions` shows Edit/Cancel (teachers, scheduled). */
export function LessonList({ lessons, role, timeZone, actions = false }: { lessons: Lesson[]; role: Role; timeZone: string; actions?: boolean }) {
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
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">{otherParty(lesson, role)}</span>
                {actions && lesson.status === "SCHEDULED" && (
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

function otherParty(lesson: Lesson, role: Role) {
  if (role === "TEACHER") return lesson.studentName;
  if (role === "STUDENT") return `with ${lesson.teacherName}`;
  return `${lesson.teacherName} → ${lesson.studentName}`;
}
