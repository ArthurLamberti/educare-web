"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { gradeAssignment, submitAnswer } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";

export type AnswerFormState = { message?: string; error?: string; saved?: boolean; values?: { answer: string } };

/** Student submits or updates their answer. */
export async function submitAnswerAction(id: number, _prev: AnswerFormState, formData: FormData): Promise<AnswerFormState> {
  await requireUser(["STUDENT"]);
  const answer = String(formData.get("answer") ?? "");
  try {
    await submitAnswer(id, answer);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message, error: error.problem.errors?.answer, values: { answer } };
    return { message: error instanceof Error ? error.message : "Unexpected error", values: { answer } };
  }
  refresh();
  return { saved: true };
}

export type GradeFormState = {
  message?: string;
  /** Set on 409: the answer version the teacher had (the student changed it since). */
  staleVersion?: number;
  errors?: Partial<Record<"score" | "feedback", string>>;
  values?: { score: string; feedback: string };
};

/** Teacher grades (or revises) and goes back to the queue. */
export async function gradeAction(id: number, version: number, _prev: GradeFormState, formData: FormData): Promise<GradeFormState> {
  await requireUser(["TEACHER"]);
  const values = { score: String(formData.get("score") ?? "").trim(), feedback: String(formData.get("feedback") ?? "") };
  const score = values.score === "" ? null : Number(values.score);
  try {
    await gradeAssignment(id, { score: score !== null && Number.isFinite(score) ? score : null, feedback: values.feedback, version });
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, staleVersion: error.status === 409 ? version : undefined, errors: error.problem.errors, values };
    }
    return { message: error instanceof Error ? error.message : "Unexpected error", values };
  }
  refresh(); // also re-renders the layout, so the "To grade" counter updates
  redirect("/grading?graded=1");
}
