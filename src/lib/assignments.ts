import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";

export type AssignmentStatus = "ASSIGNED" | "SUBMITTED" | "GRADED";

export type Assignment = {
  id: number;
  taskId: number;
  taskTitle: string;
  /** Markdown */
  instructions: string;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  /** UTC instant or null (no due date) */
  dueAt: string | null;
  assignedAt: string;
  status: AssignmentStatus;
  /** Due date passed and still not submitted (computed by the API). */
  overdue: boolean;
};

export type AssignmentQuery = {
  statuses?: AssignmentStatus[];
  studentId?: number;
  taskId?: number;
  page?: number;
  size?: number;
};

/** Soonest due first, no due date last. */
export async function listAssignments(query: AssignmentQuery = {}): Promise<Page<Assignment>> {
  const params = new URLSearchParams({ page: String(query.page ?? 0), size: String(query.size ?? 20) });
  for (const status of query.statuses ?? []) params.append("status", status);
  if (query.studentId) params.set("studentId", String(query.studentId));
  if (query.taskId) params.set("taskId", String(query.taskId));
  return normalizePage(await apiFetch(`/api/assignments?${params}`));
}

export function getAssignment(id: number): Promise<Assignment> {
  return apiFetch(`/api/assignments/${id}`);
}

/** One assignment per student; all or nothing. */
export function assignTask(taskId: number, data: { studentIds: number[]; dueAt: string | null }): Promise<Assignment[]> {
  return apiFetch(`/api/tasks/${taskId}/assignments`, { method: "POST", body: JSON.stringify(data) });
}

/** Only while ASSIGNED. */
export function unassign(id: number): Promise<void> {
  return apiFetch(`/api/assignments/${id}`, { method: "DELETE" });
}
