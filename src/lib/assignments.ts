import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";
import type { Level } from "./levels";

export type AssignmentStatus = "ASSIGNED" | "SUBMITTED" | "GRADED";

export type Assignment = {
  id: number;
  taskId: number;
  taskTitle: string;
  /** Markdown */
  instructions: string;
  /** The task's level, if any. */
  level: Level | null;
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
  /** Present once submitted. */
  submission: Submission | null;
  /** Present once graded. */
  grade: Grade | null;
  /** The student's private draft: only returned to that student. */
  draft: AnswerDraft | null;
  /** The teacher's unsent correction: only returned to the task's teacher. */
  gradeDraft: GradeDraft | null;
  /** The task's teacher has an unsent correction (false for everyone else). */
  hasGradeDraft: boolean;
};

export type AnswerDraft = {
  /** Markdown; may be empty */
  answer: string;
  savedAt: string;
};

export type GradeDraft = {
  score: number | null;
  feedback: string | null;
  savedAt: string;
};

export type Submission = {
  /** Markdown */
  answer: string;
  /** The task instructions when the student first submitted. */
  instructionsSnapshot: string;
  submittedAt: string;
  updatedAt: string;
  late: boolean;
  /** Sent back with a grade: the API refuses (409) if the answer changed since. */
  version: number;
};

export type Grade = {
  /** 0 to 10, at most one decimal */
  score: number;
  /** Markdown */
  feedback: string;
  gradedAt: string;
  gradedByName: string | null;
};

export type AssignmentQuery = {
  statuses?: AssignmentStatus[];
  studentId?: number;
  taskId?: number;
  levelId?: number;
  page?: number;
  size?: number;
};

/** Soonest due first, no due date last. */
export async function listAssignments(query: AssignmentQuery = {}): Promise<Page<Assignment>> {
  const params = new URLSearchParams({ page: String(query.page ?? 0), size: String(query.size ?? 20) });
  for (const status of query.statuses ?? []) params.append("status", status);
  if (query.studentId) params.set("studentId", String(query.studentId));
  if (query.taskId) params.set("taskId", String(query.taskId));
  if (query.levelId) params.set("levelId", String(query.levelId));
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

/** Submit or replace the answer (until graded). */
export function submitAnswer(id: number, answer: string): Promise<Assignment> {
  return apiFetch(`/api/assignments/${id}/submission`, { method: "PUT", body: JSON.stringify({ answer }) });
}

/** The student's private draft (until graded); the teacher never sees it. */
export function saveAnswerDraft(id: number, answer: string): Promise<Assignment> {
  return apiFetch(`/api/assignments/${id}/draft`, { method: "PUT", body: JSON.stringify({ answer }) });
}

/** The teacher's unsent correction; the student never sees it. */
export function saveGradeDraft(id: number, data: { score: number | null; feedback: string; version: number }): Promise<Assignment> {
  return apiFetch(`/api/assignments/${id}/grade-draft`, { method: "PUT", body: JSON.stringify(data) });
}

/** Grade or revise; `version` is the submission version the teacher reviewed. */
export function gradeAssignment(id: number, data: { score: number | null; feedback: string; version: number }): Promise<Assignment> {
  return apiFetch(`/api/assignments/${id}/grade`, { method: "PUT", body: JSON.stringify(data) });
}

/** Submitted work waiting for the teacher's grade. */
export async function countToGrade(): Promise<number> {
  return (await listAssignments({ statuses: ["SUBMITTED"], size: 1 })).totalElements;
}

/** e.g. "8.5 / 10" */
export function formatScore(score: number) {
  return `${Number.isInteger(score) ? score : score.toFixed(1)} / 10`;
}
