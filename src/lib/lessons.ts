import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";

export type LessonStatus = "SCHEDULED" | "CANCELED";

export type Lesson = {
  id: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  /** UTC instants; display them in the school's time zone (see lib/datetime). */
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  topic: string;
  notes: string | null;
  /** The teacher's own room link (Zoom, Meet...), for online lessons without a virtual room. */
  meetingUrl: string | null;
  /** Online lesson in a room created by Educare. Join any online lesson through `lessonRoomPath`. */
  virtualRoom: boolean;
  /** The teacher's notes about the lesson (plain text), visible to the student. */
  annotations: string | null;
  annotationsUpdatedAt: string | null;
  status: LessonStatus;
  /** Set when the lesson was created by a recurring series. */
  seriesId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type LessonInput = {
  /** UTC instant (ISO-8601) */
  startsAt: string;
  durationMinutes: number;
  topic: string;
  notes: string | null;
  meetingUrl: string | null;
  virtualRoom: boolean;
};

export type LessonQuery = {
  from?: Date;
  to?: Date;
  status?: LessonStatus;
  studentId?: number;
  teacherId?: number;
  descending?: boolean;
  page?: number;
  size?: number;
};

export async function listLessons(query: LessonQuery = {}): Promise<Page<Lesson>> {
  const params = new URLSearchParams({
    page: String(query.page ?? 0),
    size: String(query.size ?? 20),
    sort: query.descending ? "startsAt,desc" : "startsAt,asc",
  });
  if (query.from) params.set("from", query.from.toISOString());
  if (query.to) params.set("to", query.to.toISOString());
  if (query.status) params.set("status", query.status);
  if (query.studentId) params.set("studentId", String(query.studentId));
  if (query.teacherId) params.set("teacherId", String(query.teacherId));
  return normalizePage(await apiFetch(`/api/lessons?${params}`));
}

export function getLesson(id: number): Promise<Lesson> {
  return apiFetch(`/api/lessons/${id}`);
}

/**
 * Link to join an online lesson (the lesson's teacher and student only), made by the API at join time for
 * this user. `embedded`: a virtual room, shown inside Educare; otherwise the teacher's own link (Zoom, Meet...).
 */
export type LessonRoom =
  | { embedded: false; url: string }
  /** Virtual room: the `provider`'s client connects to `url` with this user's `token`. */
  | { embedded: true; url: string; provider: string; token: string };

export function getLessonRoom(id: number): Promise<LessonRoom> {
  return apiFetch(`/api/lessons/${id}/room`);
}

export function createLesson(data: LessonInput & { studentId: number | null }): Promise<Lesson> {
  return apiFetch("/api/lessons", { method: "POST", body: JSON.stringify(data) });
}

export function updateLesson(id: number, data: LessonInput): Promise<Lesson> {
  return apiFetch(`/api/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

/** Only the lesson's teacher; empty text clears the notes. */
export function annotateLesson(id: number, text: string): Promise<Lesson> {
  return apiFetch(`/api/lessons/${id}/annotations`, { method: "PUT", body: JSON.stringify({ text }) });
}

/** A new word of a lesson; each is sent at most once to the student's flashcards and once in a task. */
export type LessonWord = {
  id: number;
  word: string;
  meaning: string;
  createdAt: string;
  flashcardSentAt: string | null;
  taskSentAt: string | null;
};

export function getLessonWords(lessonId: number): Promise<LessonWord[]> {
  return apiFetch(`/api/lessons/${lessonId}/words`);
}

/** Adds words in order, all or nothing; answers the whole list. */
export function addLessonWords(lessonId: number, words: { word: string; meaning: string }[]): Promise<LessonWord[]> {
  return apiFetch(`/api/lessons/${lessonId}/words`, { method: "POST", body: JSON.stringify({ words }) });
}

export function deleteLessonWord(id: number): Promise<void> {
  return apiFetch(`/api/lesson-words/${id}`, { method: "DELETE" });
}

/** One card per word not yet sent, for the lesson's student. */
export function sendLessonWordsToFlashcards(lessonId: number): Promise<LessonWord[]> {
  return apiFetch(`/api/lessons/${lessonId}/words/flashcards`, { method: "POST" });
}

/** A "write a sentence with each word" task with the words not yet sent, assigned to the lesson's student. */
export function sendLessonWordsAsTask(
  lessonId: number,
  dueAt: string | null,
): Promise<{ taskId: number; assignmentId: number; words: LessonWord[] }> {
  return apiFetch(`/api/lessons/${lessonId}/words/task`, { method: "POST", body: JSON.stringify({ dueAt }) });
}

export function cancelLesson(id: number): Promise<Lesson> {
  return apiFetch(`/api/lessons/${id}/cancel`, { method: "POST" });
}

export type Weekday = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

/** Weekly lessons on some weekdays at a school-local time, with no end date. */
export type LessonSeries = {
  id: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  weekdays: Weekday[];
  /** "14:00:00", school time */
  startTime: string;
  durationMinutes: number;
  topic: string;
  notes: string | null;
  meetingUrl: string | null;
  virtualRoom: boolean;
  /** yyyy-MM-dd */
  startsOn: string;
  endedAt: string | null;
  nextLessonAt: string | null;
};

/** Active series: teachers their own, students theirs, admins all. */
export function listSeries(): Promise<LessonSeries[]> {
  return apiFetch("/api/lesson-series");
}

/** Creates the series and its lessons for the next 8 weeks (409 if any of them clashes). */
export function createSeries(data: {
  studentId: number | null;
  weekdays: string[];
  startsOn: string;
  startTime: string;
  durationMinutes: number;
  topic: string;
  notes: string | null;
  meetingUrl: string | null;
  virtualRoom: boolean;
}): Promise<{ series: LessonSeries; lessonsCreated: number }> {
  return apiFetch("/api/lesson-series", { method: "POST", body: JSON.stringify(data) });
}

/** Cancels the series' lessons from `from` (yyyy-MM-dd, school date; default today) and stops it. */
export function endSeries(id: number, from?: string): Promise<{ series: LessonSeries; lessonsCanceled: number }> {
  return apiFetch(`/api/lesson-series/${id}/end`, { method: "POST", body: JSON.stringify(from ? { from } : {}) });
}
