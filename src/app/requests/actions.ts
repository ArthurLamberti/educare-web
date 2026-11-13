"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { zonedDateTimeToInstant } from "@/lib/datetime";
import { approveRequest, createRequest, rejectRequest, withdrawRequest } from "@/lib/reschedule-requests";

export type ActionState = { message?: string; errors?: Record<string, string> };

export type RequestFormState = ActionState & { values?: { date: string; time: string; reason: string } };

function failure(error: unknown): ActionState {
  if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors };
  return { message: error instanceof Error ? error.message : "Erro inesperado" };
}

/** Student asks to move a lesson; date and time are read in the school's time zone. */
export async function requestChange(lessonId: number, _prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  const user = await requireUser(["STUDENT"]);
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const values = { date: text("date"), time: text("time"), reason: text("reason") };
  const proposed = zonedDateTimeToInstant(values.date, values.time, user.tenant.timeZone);
  if (!proposed) {
    return { values, errors: { proposedStartsAt: "Informe uma data e um horário válidos (esse horário pode não existir no fuso da escola)" } };
  }
  try {
    await createRequest(lessonId, { proposedStartsAt: proposed.toISOString(), reason: values.reason || null });
  } catch (error) {
    return { ...failure(error), values };
  }
  redirect("/requests?created=1");
}

export async function withdrawAction(id: number): Promise<ActionState> {
  await requireUser(["STUDENT"]);
  try {
    await withdrawRequest(id);
  } catch (error) {
    return failure(error);
  }
  refresh();
  return {};
}

export async function approveAction(id: number): Promise<ActionState> {
  await requireUser(["TEACHER"]);
  try {
    await approveRequest(id);
  } catch (error) {
    return failure(error);
  }
  refresh();
  return {};
}

export async function rejectAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser(["TEACHER"]);
  const note = String(formData.get("note") ?? "").trim();
  try {
    await rejectRequest(id, note || null);
  } catch (error) {
    return failure(error);
  }
  refresh();
  return {};
}
