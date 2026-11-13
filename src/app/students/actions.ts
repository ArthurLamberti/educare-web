"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { activateStudent, createStudent, deactivateStudent, updateStudent } from "@/lib/students";

type Field = "name" | "email" | "birthDate" | "initialPassword" | "teacherId";

export type StudentFormState = {
  message?: string;
  errors?: Partial<Record<Field, string>>;
  /** Typed values to keep after an error. The initial password is never sent back. */
  values?: { name: string; email: string; birthDate: string; teacherId: string };
};

function readForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const teacherId = Number(text("teacherId"));
  return {
    name: text("name"),
    email: text("email"),
    birthDate: text("birthDate") || null,
    teacherId: Number.isInteger(teacherId) && teacherId > 0 ? teacherId : null,
  };
}

export async function saveStudent(id: number | null, _prev: StudentFormState, formData: FormData): Promise<StudentFormState> {
  await requireUser(["ADMIN", "TEACHER"]);
  const data = readForm(formData);
  try {
    if (id === null) {
      await createStudent({ ...data, initialPassword: String(formData.get("initialPassword") ?? "") });
    } else {
      await updateStudent(id, data);
    }
  } catch (error) {
    const values = {
      name: data.name,
      email: data.email,
      birthDate: data.birthDate ?? "",
      teacherId: data.teacherId ? String(data.teacherId) : "",
    };
    if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors, values };
    return { message: error instanceof Error ? error.message : "Erro inesperado", values };
  }
  redirect(id === null ? "/students?created=1" : "/students");
}

export async function changeStudentStatus(id: number, active: boolean) {
  await requireUser(["ADMIN", "TEACHER"]);
  if (active) await activateStudent(id);
  else await deactivateStudent(id);
  refresh();
}
