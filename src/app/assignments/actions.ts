"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { gradeAssignment, saveAnswerDraft, saveGradeDraft, submitAnswer } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";

export type AnswerFormState = {
  message?: string;
  error?: string;
  /** What the last successful click did. */
  saved?: "draft" | "sent";
  values?: { answer: string; answers: string[] };
  /** Incremented on success, so the form restarts from the saved text. */
  done?: number;
};

/**
 * Student's answer: "draft" keeps it private (blank allowed), "send" submits it to the teacher (or
 * replaces the sent one) and clears the draft. Both work until the grade is published.
 */
export async function submitAnswerAction(id: number, prev: AnswerFormState, formData: FormData): Promise<AnswerFormState> {
  await requireUser(["STUDENT"]);
  const answer = String(formData.get("answer") ?? "");
  // One "answers" field per question, in order (none when the task has no questions).
  const answers = formData.getAll("answers").map(String);
  const values = { answer, answers };
  const intent = formData.get("intent") === "draft" ? "draft" : "sent";
  if (intent === "sent") {
    if (answers.length === 0 && !answer.trim()) return { error: "Escreva a resposta antes de enviar.", values };
    if (answers.some((a) => !a.trim())) return { message: "Responda todas as perguntas antes de enviar.", values };
  }
  try {
    if (intent === "draft") await saveAnswerDraft(id, values);
    else await submitAnswer(id, values);
  } catch (error) {
    if (error instanceof ApiError) {
      const errors = error.problem.errors;
      return { message: errors?.answers ? "Responda todas as perguntas antes de enviar." : error.message, error: errors?.answer, values };
    }
    return { message: error instanceof Error ? error.message : "Erro inesperado", values };
  }
  refresh();
  return { saved: intent, done: (prev.done ?? 0) + 1 };
}

export type GradeFormState = {
  message?: string;
  /** The correction was saved as a draft (not sent to the student). */
  drafted?: boolean;
  /** Set on 409: the answer version the teacher had (the student changed it since). */
  staleVersion?: number;
  errors?: Partial<Record<"score" | "feedback", string>>;
  values?: { score: string; feedback: string };
};

/**
 * Teacher's correction: "draft" saves it without showing it to the student (either field may be
 * empty) and stays on the page; "send" publishes the grade and goes back to the queue.
 */
export async function gradeAction(id: number, version: number, _prev: GradeFormState, formData: FormData): Promise<GradeFormState> {
  await requireUser(["TEACHER"]);
  const values = { score: String(formData.get("score") ?? "").trim(), feedback: String(formData.get("feedback") ?? "") };
  const parsed = values.score === "" ? null : Number(values.score);
  const score = parsed !== null && Number.isFinite(parsed) ? parsed : null;
  const draft = formData.get("intent") === "draft";
  try {
    if (draft) await saveGradeDraft(id, { score, feedback: values.feedback, version });
    else await gradeAssignment(id, { score, feedback: values.feedback, version });
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, staleVersion: error.status === 409 ? version : undefined, errors: error.problem.errors, values };
    }
    return { message: error instanceof Error ? error.message : "Erro inesperado", values };
  }
  if (draft) {
    refresh();
    return { drafted: true, values };
  }
  refresh(); // also re-renders the layout, so the "To grade" counter updates
  redirect("/grading?graded=1");
}
