"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import {
  addCard,
  createDeck,
  deleteCard,
  proposeDeck,
  removeDeckStudent,
  reorderCards,
  setDeckArchived,
  updateCard,
  updateDeck,
} from "@/lib/decks";

/** Only teachers write decks; the API enforces it too. */
export type ActionState = { message?: string };

export type FormState<F extends string> = {
  message?: string;
  errors?: Partial<Record<F, string>>;
  values?: Record<F, string>;
  /** Incremented on success, to reset forms. */
  done?: number;
};

function failure<F extends string>(error: unknown, values?: Record<F, string>): FormState<F> {
  if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors as Partial<Record<F, string>>, values };
  return { message: error instanceof Error ? error.message : "Unexpected error", values };
}

async function run(action: () => Promise<unknown>): Promise<ActionState> {
  await requireUser(["TEACHER"]);
  try {
    await action();
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message };
    throw error;
  }
  refresh();
  return {};
}

export async function saveDeck(id: number | null, _prev: FormState<"title" | "description">, formData: FormData) {
  await requireUser(["TEACHER"]);
  const values = { title: String(formData.get("title") ?? "").trim(), description: String(formData.get("description") ?? "").trim() };
  let deckId = id;
  try {
    const data = { title: values.title, description: values.description || null };
    if (id === null) deckId = (await createDeck(data)).id;
    else await updateDeck(id, data);
  } catch (error) {
    return failure(error, values);
  }
  redirect(`/decks/${deckId}${id === null ? "?created=1" : ""}`);
}

export async function archiveDeckAction(id: number, archived: boolean) {
  return run(() => setDeckArchived(id, archived));
}

function cardValues(formData: FormData) {
  return { front: String(formData.get("front") ?? "").trim(), back: String(formData.get("back") ?? "").trim() };
}

export async function addCardAction(deckId: number, prev: FormState<"front" | "back">, formData: FormData): Promise<FormState<"front" | "back">> {
  await requireUser(["TEACHER"]);
  const values = cardValues(formData);
  try {
    await addCard(deckId, values);
  } catch (error) {
    return failure(error, values);
  }
  refresh();
  return { done: (prev.done ?? 0) + 1 };
}

export async function updateCardAction(cardId: number, prev: FormState<"front" | "back">, formData: FormData): Promise<FormState<"front" | "back">> {
  await requireUser(["TEACHER"]);
  const values = cardValues(formData);
  try {
    await updateCard(cardId, values);
  } catch (error) {
    return failure(error, values);
  }
  refresh();
  return { done: (prev.done ?? 0) + 1 };
}

export async function deleteCardAction(cardId: number) {
  return run(() => deleteCard(cardId));
}

export async function reorderCardsAction(deckId: number, cardIds: number[]) {
  return run(() => reorderCards(deckId, cardIds));
}

export async function proposeDeckAction(deckId: number, prev: FormState<"studentIds">, formData: FormData): Promise<FormState<"studentIds">> {
  await requireUser(["TEACHER"]);
  const studentIds = formData.getAll("studentIds").map(Number);
  if (studentIds.length === 0) return { errors: { studentIds: "Choose at least one student" } };
  try {
    await proposeDeck(deckId, studentIds);
  } catch (error) {
    return failure(error);
  }
  refresh();
  return { done: (prev.done ?? 0) + 1 };
}

export async function removeDeckStudentAction(deckId: number, studentId: number) {
  return run(() => removeDeckStudent(deckId, studentId));
}
