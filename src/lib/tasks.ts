import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";

export type Task = {
  id: number;
  title: string;
  /** Markdown */
  instructions: string;
  archived: boolean;
  /** Assignments in any status; a task with assignments cannot be deleted, only archived. */
  assignmentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = { title: string; instructions: string };

/** The current teacher's tasks, newest first. */
export async function listTasks(query: { q?: string; includeArchived?: boolean; page?: number; size?: number } = {}): Promise<Page<Task>> {
  const params = new URLSearchParams({ page: String(query.page ?? 0), size: String(query.size ?? 20) });
  if (query.q) params.set("q", query.q);
  if (query.includeArchived) params.set("includeArchived", "true");
  return normalizePage(await apiFetch(`/api/tasks?${params}`));
}

export function getTask(id: number): Promise<Task> {
  return apiFetch(`/api/tasks/${id}`);
}

export function createTask(data: TaskInput): Promise<Task> {
  return apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(data) });
}

export function updateTask(id: number, data: TaskInput): Promise<Task> {
  return apiFetch(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function setTaskArchived(id: number, archived: boolean): Promise<Task> {
  return apiFetch(`/api/tasks/${id}/${archived ? "archive" : "unarchive"}`, { method: "POST" });
}

/** Only for tasks without assignments (the API answers 409 otherwise). */
export function deleteTask(id: number): Promise<void> {
  return apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
}
