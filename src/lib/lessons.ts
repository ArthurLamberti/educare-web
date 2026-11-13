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
