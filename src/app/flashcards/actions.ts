"use server";

import { refresh } from "next/cache";

import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { parseCardLines } from "@/lib/card-lines";
import { addCard, addCards, deleteCard, updateCard } from "@/lib/flashcards";

/** Only the student's teacher writes cards; the API enforces it too. */
export type ActionState = { message?: string };

export type FormState<F extends string> = {
  message?: string;
  errors?: Partial<Record<F, string>>;
  values?: Record<F, string>;
  /** Incremented on success, to reset forms. */
  done?: number;
};

type CardFormState = FormState<"front" | "back">;

function failure(error: unknown, values: Record<"front" | "back", string>): CardFormState {
  if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors as CardFormState["errors"], values };
  return { message: error instanceof Error ? error.message : "Erro inesperado", values };
}

function cardValues(formData: FormData) {
  return { front: String(formData.get("front") ?? "").trim(), back: String(formData.get("back") ?? "").trim() };
}

export async function addCardAction(studentId: number, prev: CardFormState, formData: FormData): Promise<CardFormState> {
  await requireUser(["TEACHER"]);
  const values = cardValues(formData);
  try {
    await addCard(studentId, values);
  } catch (error) {
    return failure(error, values);
  }
  refresh();
  return { done: (prev.done ?? 0) + 1 };
}

export async function updateCardAction(cardId: number, prev: CardFormState, formData: FormData): Promise<CardFormState> {
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

export async function deleteCardAction(cardId: number): Promise<ActionState> {
  await requireUser(["TEACHER"]);
  try {
    await deleteCard(cardId);
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message };
    throw error;
  }
  refresh();
  return {};
}

export type BatchState = {
  /** Problems by line, from the parser or the API. */
  errors?: string[];
  message?: string;
  /** Text to keep in the box after a failure. */
  text?: string;
  /** Cards added by the last successful submit. */
  added?: number;
  done?: number;
};

/** "palavra;tradução" per line; nothing is saved while any line has a problem. */
export async function addCardsAction(studentId: number, prev: BatchState, formData: FormData): Promise<BatchState> {
  await requireUser(["TEACHER"]);
  const text = String(formData.get("lines") ?? "");
  const parsed = parseCardLines(text);
  if (parsed.errors.length > 0) return { errors: parsed.errors, text };
  if (parsed.cards.length === 0) return { errors: ["Cole pelo menos uma linha no formato palavra;tradução."], text };
  try {
    await addCards(studentId, parsed.cards);
  } catch (error) {
    if (error instanceof ApiError) {
      // Field errors come as "cards[3].back"; point them at the pasted line.
      const errors = Object.entries((error.problem.errors ?? {}) as Record<string, string>).map(([field, detail]) => {
        const match = /^cards\[(\d+)\]\.(front|back)$/.exec(field);
        return match ? `Linha ${parsed.lines[Number(match[1])]}: ${match[2] === "front" ? "palavra" : "tradução"} ${detail}` : `${field}: ${detail}`;
      });
      return { message: error.message, errors, text };
    }
    return { message: error instanceof Error ? error.message : "Erro inesperado", text };
  }
  refresh();
  return { added: parsed.cards.length, done: (prev.done ?? 0) + 1 };
}
