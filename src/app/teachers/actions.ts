"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createTeacher, setTeacherActive, updateTeacher } from "@/lib/teachers";

type Field = "name" | "email" | "initialPassword";

export type TeacherFormState = {
  message?: string;
  errors?: Partial<Record<Field, string>>;
  /** Typed values to keep after an error. The password is never sent back. */
  values?: { name: string; email: string };
};

function failure(error: unknown, values: { name: string; email: string }): TeacherFormState {
  if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors, values };
  return { message: error instanceof Error ? error.message : "Unexpected error", values };
}

export async function saveTeacher(id: number | null, _prev: TeacherFormState, formData: FormData): Promise<TeacherFormState> {
  await requireUser(["ADMIN"]);
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  };
  try {
    if (id === null) {
      await createTeacher({ ...values, initialPassword: String(formData.get("initialPassword") ?? "") });
    } else {
      await updateTeacher(id, values);
    }
  } catch (error) {
    return failure(error, values);
  }
  redirect(id === null ? "/teachers?created=1" : "/teachers");
}

export async function changeTeacherStatus(id: number, active: boolean) {
  await requireUser(["ADMIN"]);
  await setTeacherActive(id, active);
  refresh();
}
