"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { createStudent, deleteStudent, updateStudent, type StudentRequest } from "@/lib/students";

export type StudentFormState = {
  message?: string;
  errors?: Partial<Record<keyof StudentRequest, string>>;
  values?: Partial<Record<keyof StudentRequest, string>>;
};

function readForm(formData: FormData): StudentRequest {
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  return {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    birthDate: birthDate || null,
  };
}

function failure(error: unknown, data: StudentRequest): StudentFormState {
  const values = { ...data, birthDate: data.birthDate ?? "" };
  if (error instanceof ApiError) {
    return { message: error.message, errors: error.problem.errors, values };
  }
  return {
    message: error instanceof Error ? error.message : "Unexpected error",
    values,
  };
}

export async function saveStudent(
  id: number | null,
  _prev: StudentFormState,
  formData: FormData,
): Promise<StudentFormState> {
  const data = readForm(formData);
  try {
    if (id === null) await createStudent(data);
    else await updateStudent(id, data);
  } catch (error) {
    return failure(error, data);
  }
  redirect("/students");
}

export async function removeStudent(id: number) {
  await deleteStudent(id);
  refresh();
}
