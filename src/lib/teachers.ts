import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";

export type Teacher = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  mustChangePassword: boolean;
  /** ISO instant */
  createdAt: string;
};

export type CreateTeacherRequest = { name: string; email: string; initialPassword: string };
export type UpdateTeacherRequest = { name: string; email: string };

export async function listTeachers(page = 0, size = 20): Promise<Page<Teacher>> {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort: "name" });
  return normalizePage(await apiFetch(`/api/teachers?${params}`));
}

export function getTeacher(id: number): Promise<Teacher> {
  return apiFetch(`/api/teachers/${id}`);
}

export function createTeacher(data: CreateTeacherRequest): Promise<Teacher> {
  return apiFetch("/api/teachers", { method: "POST", body: JSON.stringify(data) });
}

export function updateTeacher(id: number, data: UpdateTeacherRequest): Promise<Teacher> {
  return apiFetch(`/api/teachers/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function setTeacherActive(id: number, active: boolean): Promise<void> {
  return apiFetch(`/api/teachers/${id}/${active ? "activate" : "deactivate"}`, { method: "POST" });
}
