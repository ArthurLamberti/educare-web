import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";

export type Student = {
  id: number;
  name: string;
  email: string;
  /** ISO date (yyyy-MM-dd) */
  birthDate: string | null;
  teacherId: number;
  teacherName: string;
  active: boolean;
  /** ISO instant */
  createdAt: string;
};

export type CreateStudentRequest = {
  name: string;
  email: string;
  birthDate: string | null;
  initialPassword: string;
  /** Required for admins; ignored by the API for teachers. */
  teacherId: number | null;
};

export type UpdateStudentRequest = {
  name: string;
  email: string;
  birthDate: string | null;
  /** Admins only: reassign to another teacher. */
  teacherId: number | null;
};

export type StudentFilters = { teacherId?: number; includeInactive?: boolean };

export async function listStudents(page = 0, size = 20, filters: StudentFilters = {}): Promise<Page<Student>> {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort: "name" });
  if (filters.teacherId) params.set("teacherId", String(filters.teacherId));
  if (filters.includeInactive) params.set("includeInactive", "true");
  return normalizePage(await apiFetch(`/api/students?${params}`));
}

export function getStudent(id: number): Promise<Student> {
  return apiFetch(`/api/students/${id}`);
}

export function createStudent(data: CreateStudentRequest): Promise<Student> {
  return apiFetch("/api/students", { method: "POST", body: JSON.stringify(data) });
}

export function updateStudent(id: number, data: UpdateStudentRequest): Promise<Student> {
  return apiFetch(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

/** The student loses access but keeps their history. */
export function deactivateStudent(id: number): Promise<void> {
  return apiFetch(`/api/students/${id}`, { method: "DELETE" });
}

export function activateStudent(id: number): Promise<void> {
  return apiFetch(`/api/students/${id}/activate`, { method: "POST" });
}
