"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { zonedDateTimeToInstant } from "@/lib/datetime";
import { cancelLesson, createLesson, updateLesson } from "@/lib/lessons";

type Field = "studentId" | "startsAt" | "durationMinutes" | "topic" | "notes";

export type LessonFormState = {
  message?: string;
  errors?: Partial<Record<Field, string>>;
  /** Typed values to keep after an error. */
  values?: { studentId: string; date: string; time: string; durationMinutes: string; topic: string; notes: string };
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
  };

  const startsAt = zonedDateTimeToInstant(values.date, values.time, user.tenant.timeZone);
  if (!startsAt) {
    return { values, errors: { startsAt: "Enter a valid date and time (this time may not exist in the school's time zone)" } };
  }
  const studentId = Number(values.studentId);
  const data = {
    startsAt: startsAt.toISOString(),
    durationMinutes: Number(values.durationMinutes),
    topic: values.topic,
    notes: values.notes || null,
  };

  try {
    if (id === null) {
      await createLesson({ ...data, studentId: Number.isInteger(studentId) && studentId > 0 ? studentId : null });
    } else {
      await updateLesson(id, data);
    }
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors, values };
    return { message: error instanceof Error ? error.message : "Unexpected error", values };
  }
  redirect(id === null ? "/lessons?created=1" : "/lessons");
}

export async function cancelLessonAction(id: number) {
  await requireUser(["TEACHER"]);
  await cancelLesson(id);
  refresh();
}
