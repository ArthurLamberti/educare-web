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

export function createLesson(data: LessonInput & { studentId: number | null }): Promise<Lesson> {
  return apiFetch("/api/lessons", { method: "POST", body: JSON.stringify(data) });
}

export function updateLesson(id: number, data: LessonInput): Promise<Lesson> {
  return apiFetch(`/api/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) });
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
}): Promise<{ series: LessonSeries; lessonsCreated: number }> {
  return apiFetch("/api/lesson-series", { method: "POST", body: JSON.stringify(data) });
}

/** Cancels the series' lessons from `from` (yyyy-MM-dd, school date; default today) and stops it. */
export function endSeries(id: number, from?: string): Promise<{ series: LessonSeries; lessonsCanceled: number }> {
  return apiFetch(`/api/lesson-series/${id}/end`, { method: "POST", body: JSON.stringify(from ? { from } : {}) });
}
