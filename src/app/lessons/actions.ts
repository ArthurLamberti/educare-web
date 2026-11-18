"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { zonedDateTimeToInstant } from "@/lib/datetime";
import type { RoomChoice } from "@/lib/lesson-room";
import { parseCardLines } from "@/lib/card-lines";
import {
  addLessonWords,
  annotateLesson,
  cancelLesson,
  createLesson,
  createSeries,
  deleteLessonWord,
  endSeries,
  sendLessonWordsAsTask,
  sendLessonWordsToFlashcards,
  updateLesson,
} from "@/lib/lessons";

type Field = "studentId" | "startsAt" | "durationMinutes" | "topic" | "notes" | "weekdays" | "meetingUrl";

export type LessonFormState = {
  message?: string;
  errors?: Partial<Record<Field, string>>;
  /** Typed values to keep after an error. */
  values?: {
    studentId: string;
    date: string;
    time: string;
    durationMinutes: string;
    topic: string;
    notes: string;
    repeat: boolean;
    weekdays: string[];
    online: boolean;
    room: RoomChoice;
    meetingUrl: string;
  };
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
    online: formData.get("online") === "1",
    room: (formData.get("room") === "link" ? "link" : "virtual") as RoomChoice,
    meetingUrl: text("meetingUrl"),
  };
  const ownLink = values.online && values.room === "link";
  const meetingUrlError = checkMeetingUrl(ownLink, values.meetingUrl);
  if (meetingUrlError) return { values, errors: { meetingUrl: meetingUrlError } };
  const room = { meetingUrl: ownLink ? values.meetingUrl : null, virtualRoom: values.online && !ownLink };

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
    ...room,
  };

  if (values.repeat) return saveSeries(values, room);

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

/** The teacher's own room link is required, and only http(s) links are accepted (no `javascript:`). */
function checkMeetingUrl(ownLink: boolean, url: string): string | undefined {
  if (!ownLink) return undefined;
  if (!url) return "Informe o link da sala";
  if (!/^https?:\/\/\S+$/i.test(url)) return "Use um link completo, começando com https://";
  if (url.length > 500) return "Link muito longo";
  return undefined;
}

/** A new recurring series: the first lesson's date and time, repeated every week on the chosen weekdays. */
async function saveSeries(
  values: NonNullable<LessonFormState["values"]>,
  room: { meetingUrl: string | null; virtualRoom: boolean },
): Promise<LessonFormState> {
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
        ...room,
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

export type AnnotationsState = { message?: string; savedAt?: string; text?: string };

/** The teacher's notes about a lesson (the API checks it is theirs). */
export async function saveAnnotations(id: number, _prev: AnnotationsState, formData: FormData): Promise<AnnotationsState> {
  await requireUser(["TEACHER"]);
  const text = String(formData.get("annotations") ?? "");
  try {
    const lesson = await annotateLesson(id, text);
    return { savedAt: lesson.annotationsUpdatedAt ?? undefined, text: lesson.annotations ?? "" };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message, text };
    return { message: error instanceof Error ? error.message : "Erro inesperado", text };
  }
}

export type WordsFormState = { message?: string; errors?: string[]; text?: string; added?: number; done?: number };

/** Pasted "palavra;tradução" lines become new words of the lesson (all or nothing). */
export async function addWordsAction(lessonId: number, prev: WordsFormState, formData: FormData): Promise<WordsFormState> {
  await requireUser(["TEACHER"]);
  const text = String(formData.get("lines") ?? "");
  const parsed = parseCardLines(text);
  if (parsed.errors.length > 0) return { errors: parsed.errors, text };
  if (parsed.cards.length === 0) return { errors: ["Escreva pelo menos uma linha no formato palavra;tradução."], text };
  try {
    await addLessonWords(lessonId, parsed.cards.map((c) => ({ word: c.front, meaning: c.back })));
  } catch (error) {
    if (error instanceof ApiError) {
      // Field errors come as "words[3].word"; point them at the typed line.
      const errors = Object.entries((error.problem.errors ?? {}) as Record<string, string>).map(([field, detail]) => {
        const match = /^words\[(\d+)\]\.(word|meaning)$/.exec(field);
        return match ? `Linha ${parsed.lines[Number(match[1])]}: ${match[2] === "word" ? "palavra" : "tradução"} ${detail}` : `${field}: ${detail}`;
      });
      const message = error.status === 409 ? "Uma aula pode ter no máximo 200 palavras." : error.message;
      return { message, errors, text };
    }
    return { message: error instanceof Error ? error.message : "Erro inesperado", text };
  }
  refresh();
  return { added: parsed.cards.length, done: (prev.done ?? 0) + 1 };
}

export async function deleteWordAction(id: number): Promise<{ message?: string }> {
  await requireUser(["TEACHER"]);
  try {
    await deleteLessonWord(id);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message };
    throw error;
  }
  refresh();
  return {};
}

export type SendWordsState = {
  message?: string;
  sent?: number;
  /** Words skipped because the student already had them as cards. */
  skipped?: string[];
  taskId?: number;
  dueError?: string;
  done?: number;
};

/** Words not yet sent become cards of the lesson's student. */
export async function sendWordsToFlashcardsAction(lessonId: number, prev: SendWordsState): Promise<SendWordsState> {
  await requireUser(["TEACHER"]);
  let sent: number;
  let skipped: string[];
  try {
    const result = await sendLessonWordsToFlashcards(lessonId);
    // The words just sent share the newest timestamp; the skipped ones are among them.
    const times = result.words.map((w) => w.flashcardSentAt).filter((t) => t !== null);
    const newest = times.reduce((a, b) => (a > b ? a : b), "");
    skipped = result.skipped;
    sent = times.filter((t) => t === newest).length - skipped.length;
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { message: error.problem.detail?.includes("at most") ? "O aluno atingiu o limite de flashcards." : "Todas as palavras já estão nos flashcards do aluno." };
    }
    if (error instanceof ApiError) return { message: error.message };
    throw error;
  }
  refresh();
  return { sent, skipped, done: (prev.done ?? 0) + 1 };
}

/** Words not yet in a task become a sentence-writing task for the student; the due date is the school's wall clock. */
export async function sendWordsAsTaskAction(lessonId: number, prev: SendWordsState, formData: FormData): Promise<SendWordsState> {
  const user = await requireUser(["TEACHER"]);
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim() || "23:59";
  let dueAt: string | null = null;
  if (date) {
    const instant = zonedDateTimeToInstant(date, time, user.tenant.timeZone);
    if (!instant) return { dueError: "Informe uma data e um horário válidos (esse horário pode não existir no fuso da escola)" };
    dueAt = instant.toISOString();
  }
  let taskId: number;
  try {
    taskId = (await sendLessonWordsAsTask(lessonId, dueAt)).taskId;
  } catch (error) {
    if (error instanceof ApiError && error.problem.errors?.dueAt) return { dueError: "A data de entrega precisa estar no futuro." };
    if (error instanceof ApiError && error.status === 409) return { message: "Todas as palavras já foram enviadas em uma tarefa." };
    if (error instanceof ApiError) return { message: error.message };
    throw error;
  }
  refresh();
  return { taskId, done: (prev.done ?? 0) + 1 };
}
