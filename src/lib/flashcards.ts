import "server-only";

import { apiFetch } from "./api";

/** One of a student's flashcards, with their review state. */
export type Card = {
  id: number;
  studentId: number;
  front: string;
  back: string;
  /** Never rated by the student. */
  isNew: boolean;
  /** Next review; null for new cards. */
  dueAt: string | null;
  intervalDays: number;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** One student's flashcard counters ("today" is the school's day). */
export type FlashcardProgress = {
  studentId: number;
  name: string;
  cards: number;
  newCards: number;
  /** Interval under 21 days. */
  learning: number;
  /** Interval of 21 days or more. */
  mature: number;
  dueToday: number;
  /** New cards still allowed today (20 per day). */
  newToday: number;
  reviewsLast7Days: number;
};

/** In creation order: the student's teacher, admins and the student themself. */
export function listStudentCards(studentId: number): Promise<Card[]> {
  return apiFetch(`/api/students/${studentId}/cards`);
}

/** The logged-in student's cards. */
export function listMyCards(): Promise<Card[]> {
  return apiFetch("/api/cards");
}

export function addCard(studentId: number, data: { front: string; back: string }): Promise<Card> {
  return apiFetch(`/api/students/${studentId}/cards`, { method: "POST", body: JSON.stringify(data) });
}

/** Adds the cards in order; all are saved or none. */
export function addCards(studentId: number, cards: { front: string; back: string }[]): Promise<Card[]> {
  return apiFetch(`/api/students/${studentId}/cards/batch`, { method: "POST", body: JSON.stringify({ cards }) });
}

export function updateCard(id: number, data: { front: string; back: string }): Promise<Card> {
  return apiFetch(`/api/cards/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteCard(id: number): Promise<void> {
  return apiFetch(`/api/cards/${id}`, { method: "DELETE" });
}

/** Teachers: their active students; admins: all active students. */
export function listFlashcardProgress(): Promise<FlashcardProgress[]> {
  return apiFetch("/api/flashcards/progress");
}

/** Cards a study session offers today: due reviews plus the new cards still allowed. */
export function toReviewToday(progress: Pick<FlashcardProgress, "dueToday" | "newToday">) {
  return progress.dueToday + progress.newToday;
}

/** "Novo", "Aprendendo" (under 21 days) or "Maduro". */
export function cardStage(card: Pick<Card, "isNew" | "intervalDays">) {
  if (card.isNew) return "Novo";
  return card.intervalDays >= 21 ? "Maduro" : "Aprendendo";
}
