"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveLesson, type LessonFormState } from "@/app/lessons/actions";
import { WEEKDAYS } from "@/lib/weekdays";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

/** 15 to 240 minutes in steps of 15. */
const DURATIONS = Array.from({ length: 16 }, (_, i) => (i + 1) * 15);

/** Weekday of a yyyy-MM-dd date (calendar date, no time zone involved). */
function weekdayOf(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return WEEKDAYS[(d.getUTCDay() + 6) % 7][0];
}

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
  const [repeat, setRepeat] = useState(state.values?.repeat ?? false);
  const [date, setDate] = useState(values.date);
  const [picked, setPicked] = useState<string[] | null>(state.values?.weekdays ?? null);
  // Until the teacher picks weekdays, follow the start date's weekday.
  const fromDate = weekdayOf(date);
  const weekdays = picked ?? (fromDate ? [fromDate] : []);
  const toggle = (day: string) => setPicked(weekdays.includes(day) ? weekdays.filter((d) => d !== day) : [...weekdays, day]);

  // Remount inputs when the action returns values, so defaultValue applies again.
  const k = JSON.stringify(state.values ?? null);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <FormMessage message={state.message} />

      {lesson ? (
        <p className="text-sm">
          <span className="font-bold">Aluno:</span> {lesson.studentName}
        </p>
      ) : (
        <Field label="Aluno" error={state.errors?.studentId}>
          <select name="studentId" required defaultValue={values.studentId} key={`s-${k}`} className={inputClass}>
            <option value="" disabled>
              Escolha um aluno
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
          <Field label={repeat ? "Primeira aula em" : "Data"}>
            <input
              name="date"
              type="date"
              required
              defaultValue={values.date}
              key={`d-${k}`}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Horário de início">
            <input name="time" type="time" required step={300} defaultValue={values.time} key={`t-${k}`} className={inputClass} />
          </Field>
        </div>
        {state.errors?.startsAt && <span className="text-xs text-red-600">{state.errors.startsAt}</span>}
        <span className="text-xs text-ink-500">Horário da escola ({timeZone.replaceAll("_", " ")})</span>
      </div>

      {!lesson && (
        <fieldset className="flex flex-col gap-2 rounded-md border border-ink-200 px-4 py-3 dark:border-ink-800">
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" name="repeat" value="1" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="size-4 accent-brand-600" />
            Repetir toda semana
          </label>
          {repeat && (
            <>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Dias da semana">
                {WEEKDAYS.map(([day, label]) => {
                  const on = weekdays.includes(day);
                  return (
                    <label
                      key={day}
                      className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm font-bold select-none has-focus-visible:outline-2 has-focus-visible:outline-brand-500 ${
                        on
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-ink-300 text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
                      }`}
                    >
                      <input type="checkbox" name="weekdays" value={day} checked={on} onChange={() => toggle(day)} className="sr-only" />
                      {label}
                    </label>
                  );
                })}
              </div>
              {state.errors?.weekdays && <span className="text-xs text-red-600">{state.errors.weekdays}</span>}
              <span className="text-xs text-ink-500">
                Sem data de fim: as aulas são criadas para as próximas 8 semanas e renovadas automaticamente. Para parar, encerre a série na lista de aulas.
              </span>
            </>
          )}
        </fieldset>
      )}

      <Field label="Duração" error={state.errors?.durationMinutes}>
        <select name="durationMinutes" required defaultValue={values.durationMinutes} key={`du-${k}`} className={inputClass}>
          {DURATIONS.map((m) => (
            <option key={m} value={m}>
              {durationLabel(m)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Assunto" error={state.errors?.topic}>
        <input name="topic" required maxLength={200} defaultValue={values.topic} key={`to-${k}`} className={inputClass} />
      </Field>

      <Field label="Observações" error={state.errors?.notes}>
        <textarea name="notes" rows={4} maxLength={2000} defaultValue={values.notes} key={`n-${k}`} className={inputClass} />
      </Field>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando..." : repeat ? "Criar aulas recorrentes" : "Salvar"}
        </button>
        <Link href="/lessons" className="rounded-md px-4 py-2 text-sm font-bold text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
