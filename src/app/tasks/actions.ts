"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { assignTask, unassign } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { zonedDateTimeToInstant } from "@/lib/datetime";
import { createTask, deleteTask, setTaskArchived, updateTask } from "@/lib/tasks";

export type ActionState = { message?: string };

export type TaskFormState = {
  message?: string;
  errors?: Partial<Record<"title" | "instructions", string>>;
  values?: { title: string; instructions: string };
};

export async function saveTask(id: number | null, _prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  await requireUser(["TEACHER"]);
  const values = { title: String(formData.get("title") ?? "").trim(), instructions: String(formData.get("instructions") ?? "").trim() };
  let taskId = id;
  try {
    if (id === null) taskId = (await createTask(values)).id;
    else await updateTask(id, values);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors, values };
    return { message: error instanceof Error ? error.message : "Erro inesperado", values };
  }
  redirect(`/tasks/${taskId}${id === null ? "?created=1" : ""}`);
}

export async function archiveTaskAction(id: number, archived: boolean): Promise<ActionState> {
  await requireUser(["TEACHER"]);
  try {
    await setTaskArchived(id, archived);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message };
    throw error;
  }
  refresh();
  return {};
}

export async function deleteTaskAction(id: number): Promise<ActionState> {
  await requireUser(["TEACHER"]);
  try {
    await deleteTask(id);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message };
    throw error;
  }
  redirect("/tasks?deleted=1");
}

export type AssignFormState = {
  message?: string;
  errors?: Partial<Record<"studentIds" | "dueAt", string>>;
  values?: { studentIds: string[]; date: string; time: string };
  /** Number of assignments created by the last successful submit. */
  assigned?: number;
};

/** The due date is read as the school's wall clock; an empty date means no due date. */
export async function assignTaskAction(taskId: number, _prev: AssignFormState, formData: FormData): Promise<AssignFormState> {
  const user = await requireUser(["TEACHER"]);
  const values = {
    studentIds: formData.getAll("studentIds").map(String),
    date: String(formData.get("date") ?? "").trim(),
    time: String(formData.get("time") ?? "").trim() || "23:59",
  };
  if (values.studentIds.length === 0) return { values, errors: { studentIds: "Escolha pelo menos um aluno" } };

  let dueAt: string | null = null;
  if (values.date) {
    const instant = zonedDateTimeToInstant(values.date, values.time, user.tenant.timeZone);
    if (!instant) return { values, errors: { dueAt: "Informe uma data e um horário válidos (esse horário pode não existir no fuso da escola)" } };
    dueAt = instant.toISOString();
  }

  let created: number;
  try {
    created = (await assignTask(taskId, { studentIds: values.studentIds.map(Number), dueAt })).length;
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors, values };
    return { message: error instanceof Error ? error.message : "Erro inesperado", values };
  }
  refresh();
  return { assigned: created };
}

export async function unassignAction(id: number): Promise<ActionState> {
  await requireUser(["TEACHER"]);
  try {
    await unassign(id);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message };
    throw error;
  }
  refresh();
  return {};
}
