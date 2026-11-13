"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveLesson, type LessonFormState } from "@/app/lessons/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

/** 15 to 240 minutes in steps of 15. */
const DURATIONS = Array.from({ length: 16 }, (_, i) => (i + 1) * 15);

type StudentOption = { id: number; name: string };

/** Initial values with date/time already converted to the school's time zone. */
export type LessonFormValues = {
  id: number;
  studentName: string;
  date: string;
  time: string;
  durationMinutes: number;
  topic: string;
  notes: string | null;
};

function durationLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h && `${h}h`, m && `${m}min`].filter(Boolean).join(" ");
}

/** New lessons choose a student from `students`; an existing lesson keeps its student. */
export function LessonForm({ lesson, students, timeZone }: { lesson?: LessonFormValues; students?: StudentOption[]; timeZone: string }) {
  const action = saveLesson.bind(null, lesson?.id ?? null);
  const [state, formAction, pending] = useActionState<LessonFormState, FormData>(action, {});

  const values = {
    studentId: state.values?.studentId ?? "",
    date: state.values?.date ?? lesson?.date ?? "",
    time: state.values?.time ?? lesson?.time ?? "",
    durationMinutes: state.values?.durationMinutes ?? String(lesson?.durationMinutes ?? 60),
    topic: state.values?.topic ?? lesson?.topic ?? "",
    notes: state.values?.notes ?? lesson?.notes ?? "",
  };
  // Remount inputs when the action returns values, so defaultValue applies again.
  const k = JSON.stringify(state.values ?? null);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <FormMessage message={state.message} />

      {lesson ? (
        <p className="text-sm">
          <span className="font-medium">Student:</span> {lesson.studentName}
        </p>
      ) : (
        <Field label="Student" error={state.errors?.studentId}>
          <select name="studentId" required defaultValue={values.studentId} key={`s-${k}`} className={inputClass}>
            <option value="" disabled>
              Choose a student
            </option>
            {students?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date">
            <input name="date" type="date" required defaultValue={values.date} key={`d-${k}`} className={inputClass} />
          </Field>
          <Field label="Start time">
            <input name="time" type="time" required step={300} defaultValue={values.time} key={`t-${k}`} className={inputClass} />
          </Field>
        </div>
        {state.errors?.startsAt && <span className="text-xs text-red-600">{state.errors.startsAt}</span>}
        <span className="text-xs text-zinc-500">School time ({timeZone.replaceAll("_", " ")})</span>
      </div>

      <Field label="Duration" error={state.errors?.durationMinutes}>
        <select name="durationMinutes" required defaultValue={values.durationMinutes} key={`du-${k}`} className={inputClass}>
          {DURATIONS.map((m) => (
            <option key={m} value={m}>
              {durationLabel(m)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Topic" error={state.errors?.topic}>
        <input name="topic" required maxLength={200} defaultValue={values.topic} key={`to-${k}`} className={inputClass} />
      </Field>

      <Field label="Notes" error={state.errors?.notes}>
        <textarea name="notes" rows={4} maxLength={2000} defaultValue={values.notes} key={`n-${k}`} className={inputClass} />
      </Field>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : "Save"}
        </button>
        <Link href="/lessons" className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </Link>
      </div>
    </form>
  );
}
