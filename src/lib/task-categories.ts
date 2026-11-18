import "server-only";

import { apiFetch } from "./api";

/** One of the teacher's own task categories. */
export type TaskCategory = { id: number; name: string };

/** A category in the teacher's list, with how many tasks use it. */
export type TaskCategoryItem = TaskCategory & { taskCount: number };

/** The current teacher's categories, alphabetical. */
export function listTaskCategories(): Promise<TaskCategoryItem[]> {
  return apiFetch("/api/task-categories");
}

/** Names are unique per teacher ignoring case (409 otherwise); at most 100 categories. */
export function createTaskCategory(name: string): Promise<TaskCategory> {
  return apiFetch("/api/task-categories", { method: "POST", body: JSON.stringify({ name }) });
}

export function renameTaskCategory(id: number, name: string): Promise<TaskCategory> {
  return apiFetch(`/api/task-categories/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
}

/** Its tasks are left without a category. */
export function deleteTaskCategory(id: number): Promise<void> {
  return apiFetch(`/api/task-categories/${id}`, { method: "DELETE" });
}
