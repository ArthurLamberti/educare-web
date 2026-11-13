"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { zonedDateTimeToInstant } from "@/lib/datetime";
import { cancelLesson, createLesson, createSeries, endSeries, updateLesson } from "@/lib/lessons";

type Field = "studentId" | "startsAt" | "durationMinutes" | "topic" | "notes" | "weekdays";

export type LessonFormState = {
  message?: string;
  errors?: Partial<Record<Field, string>>;
  /** Typed values to keep after an error. */
  values?: { studentId: string; date: string; time: string; durationMinutes: string; topic: string; notes: string; repeat: boolean; weekdays: string[] };
};

/**
 * Date and time are read as the school's wall clock (not the browser's) and sent as a UTC instant.
 * Only teachers write lessons; the API enforces it too.
 */
export async function saveLesson(id: number | null, _prev: LessonFormState, formData: FormData): Promise<LessonFormState> {
  const user = await requireUser(["TEACHER"]);
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const values = {
    studentId: text("studentId"),
    date: text("date"),
    time: text("time"),
    durationMinutes: text("durationMinutes"),
    topic: text("topic"),
    notes: text("notes"),
    repeat: id === null && formData.get("repeat") === "1",
    weekdays: formData.getAll("weekdays").map(String),
  };

  const startsAt = zonedDateTimeToInstant(values.date, values.time, user.tenant.timeZone);
  if (!startsAt) {
    return { values, errors: { startsAt: "Informe uma data e um horário válidos (esse horário pode não existir no fuso da escola)" } };
  }
  const studentId = Number(values.studentId);
  const data = {
    startsAt: startsAt.toISOString(),
    durationMinutes: Number(values.durationMinutes),
    topic: values.topic,
    notes: values.notes || null,
  };

  if (values.repeat) return saveSeries(values);

  try {
    if (id === null) {
      await createLesson({ ...data, studentId: Number.isInteger(studentId) && studentId > 0 ? studentId : null });
    } else {
      await updateLesson(id, data);
    }
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors, values };
    return { message: error instanceof Error ? error.message : "Erro inesperado", values };
  }
  redirect(id === null ? "/lessons?created=1" : "/lessons");
}

/** A new recurring series: the first lesson's date and time, repeated every week on the chosen weekdays. */
async function saveSeries(values: NonNullable<LessonFormState["values"]>): Promise<LessonFormState> {
  if (values.weekdays.length === 0) return { values, errors: { weekdays: "Escolha pelo menos um dia da semana" } };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || !/^\d{2}:\d{2}$/.test(values.time)) {
    return { values, errors: { startsAt: "Informe a data de início e o horário" } };
  }
  const studentId = Number(values.studentId);
  let created: number;
  try {
    created = (
      await createSeries({
        studentId: Number.isInteger(studentId) && studentId > 0 ? studentId : null,
        weekdays: values.weekdays,
        startsOn: values.date,
        startTime: values.time,
        durationMinutes: Number(values.durationMinutes),
        topic: values.topic,
        notes: values.notes || null,
      })
    ).lessonsCreated;
  } catch (error) {
    if (error instanceof ApiError) {
      const errors = (error.problem.errors ?? {}) as Record<string, string>;
      const startsAt = errors.startsOn ?? errors.startTime;
      return { message: error.message, errors: { ...errors, ...(startsAt && { startsAt }) }, values };
    }
    return { message: error instanceof Error ? error.message : "Erro inesperado", values };
  }
  redirect(`/lessons?created=series&n=${created}`);
}

/** Cancels the series' lessons from `from` (school date; default today) and stops creating new ones. */
export async function endSeriesAction(seriesId: number, from?: string): Promise<{ message?: string }> {
  await requireUser(["TEACHER"]);
  try {
    await endSeries(seriesId, from);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message };
    throw error;
  }
  refresh();
  return {};
}

export async function cancelLessonAction(id: number) {
  await requireUser(["TEACHER"]);
  await cancelLesson(id);
  refresh();
}
