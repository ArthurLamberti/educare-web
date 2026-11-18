"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { assignTask, unassign } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { zonedDateTimeToInstant } from "@/lib/datetime";
import { createTaskCategory, deleteTaskCategory, renameTaskCategory } from "@/lib/task-categories";
import { createTask, deleteTask, setTaskArchived, updateTask } from "@/lib/tasks";

export type ActionState = { message?: string };

export type TaskFormState = {
  message?: string;
  errors?: Partial<Record<"title" | "instructions" | "levelId" | "categoryId" | "questions", string>>;
  values?: { title: string; instructions: string; levelId: string; categoryId: string; questions: string[] };
};

export async function saveTask(id: number | null, _prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  await requireUser(["TEACHER"]);
  const values = {
    title: String(formData.get("title") ?? "").trim(),
    instructions: String(formData.get("instructions") ?? "").trim(),
    levelId: String(formData.get("levelId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    // One "question" field per question, in order; blank ones are dropped.
    questions: formData.getAll("question").map((q) => String(q).trim()).filter(Boolean),
  };
  if (!values.instructions && values.questions.length === 0) {
    return { errors: { instructions: "Escreva as instruções ou adicione pelo menos uma pergunta." }, values };
  }
  const input = {
    questions: values.questions.map((prompt) => ({ prompt })),
    title: values.title,
    instructions: values.instructions,
    levelId: Number(values.levelId) > 0 ? Number(values.levelId) : null,
    categoryId: Number(values.categoryId) > 0 ? Number(values.categoryId) : null,
  };
  let taskId = id;
  try {
    if (id === null) taskId = (await createTask(input)).id;
    else await updateTask(id, input);
  } catch (error) {
    if (error instanceof ApiError) {
      const errors = { ...error.problem.errors };
      // e.g. "questions[2].prompt" → one message on the questions block
      if (Object.keys(errors).some((k) => k.startsWith("questions"))) errors.questions = "Cada pergunta pode ter até 2000 caracteres; no máximo 50 perguntas.";
      return { message: error.message, errors, values };
    }
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

export type CategoryResult = { message?: string; category?: { id: number; name: string } };

/** The API's 409s for categories, in the UI's words. */
function categoryError(error: unknown): CategoryResult {
  if (error instanceof ApiError && error.status === 409) {
    return {
      message: error.problem.detail?.includes("at most") ? "Você atingiu o limite de 100 categorias." : "Já existe uma categoria com esse nome.",
    };
  }
  if (error instanceof ApiError) return { message: error.problem.errors?.name ? "Informe um nome de até 60 caracteres." : error.message };
  throw error;
}

/** Creates one of the teacher's categories; returns it so a form can select it. */
export async function createCategoryAction(name: string): Promise<CategoryResult> {
  await requireUser(["TEACHER"]);
  if (!name.trim()) return { message: "Informe o nome da categoria." };
  try {
    const category = await createTaskCategory(name.trim());
    refresh();
    return { category };
  } catch (error) {
    return categoryError(error);
  }
}

export async function renameCategoryAction(id: number, name: string): Promise<CategoryResult> {
  await requireUser(["TEACHER"]);
  if (!name.trim()) return { message: "Informe o nome da categoria." };
  try {
    const category = await renameTaskCategory(id, name.trim());
    refresh();
    return { category };
  } catch (error) {
    return categoryError(error);
  }
}

/** Its tasks are left without a category. */
export async function deleteCategoryAction(id: number): Promise<CategoryResult> {
  await requireUser(["TEACHER"]);
  try {
    await deleteTaskCategory(id);
  } catch (error) {
    return categoryError(error);
  }
  refresh();
  return {};
}
