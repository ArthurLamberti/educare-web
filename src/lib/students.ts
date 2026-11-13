import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";

export type Student = {
  id: number;
  name: string;
  email: string;
  /** ISO date (yyyy-MM-dd) */
  birthDate: string | null;
  /** ISO instant */
  createdAt: string;
};

export type StudentRequest = {
  name: string;
  email: string;
  birthDate: string | null;
};

export async function listStudents(page = 0, size = 20): Promise<Page<Student>> {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort: "name" });
  return normalizePage(await apiFetch(`/api/students?${params}`));
}

export function getStudent(id: number): Promise<Student> {
  return apiFetch(`/api/students/${id}`);
}

export function createStudent(data: StudentRequest): Promise<Student> {
  return apiFetch("/api/students", { method: "POST", body: JSON.stringify(data) });
}

export function updateStudent(id: number, data: StudentRequest): Promise<Student> {
  return apiFetch(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteStudent(id: number): Promise<void> {
  return apiFetch(`/api/students/${id}`, { method: "DELETE" });
}
