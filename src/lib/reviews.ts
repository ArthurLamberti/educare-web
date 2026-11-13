import "server-only";

import { apiFetch } from "./api";

export type Rating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type QueueCard = {
  cardId: number;
  deckId: number;
  deckTitle: string;
  front: string;
  back: string;
  /** Never reviewed by this student. */
  isNew: boolean;
  dueAt: string | null;
};

export type Queue = {
  /** All due cards (the list holds at most 200). */
  dueCount: number;
  /** New cards in this queue (20 per deck per school day). */
  newCount: number;
  cards: QueueCard[];
  /** When the next card becomes due, if none is due now. */
  nextDueAt: string | null;
};

export type RateResult = { cardId: number; rating: Rating; dueAt: string; intervalDays: number; ease: number; repetitions: number };

/** A student's progress on one deck. */
export type DeckProgress = {
  deckId: number;
  deckTitle: string;
  newCards: number;
  learning: number;
  mature: number;
  dueToday: number;
  /** New cards still allowed today. */
  newToday: number;
  reviewsLast7Days: number;
};

/** One student's progress on a teacher's deck. */
export type StudentProgress = {
  studentId: number;
  name: string;
  newCards: number;
  learning: number;
  mature: number;
  dueToday: number;
  reviewsLast7Days: number;
};

export function getQueue(deckId?: number): Promise<Queue> {
  return apiFetch(`/api/reviews/queue${deckId ? `?deckId=${deckId}` : ""}`);
}

export function rateCard(cardId: number, rating: Rating): Promise<RateResult> {
  return apiFetch("/api/reviews", { method: "POST", body: JSON.stringify({ cardId, rating }) });
}

export function getStudentProgress(): Promise<DeckProgress[]> {
  return apiFetch("/api/reviews/progress");
}

export function getDeckProgress(deckId: number): Promise<StudentProgress[]> {
  return apiFetch(`/api/decks/${deckId}/progress`);
}

/** Cards a study session offers today: due reviews plus the new cards still allowed. */
export function toReviewToday(progress: Pick<DeckProgress, "dueToday" | "newToday">) {
  return progress.dueToday + progress.newToday;
}
