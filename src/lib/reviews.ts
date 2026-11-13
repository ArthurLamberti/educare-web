import "server-only";

import { apiFetch } from "./api";
import type { FlashcardProgress } from "./flashcards";

export type Rating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type QueueCard = {
  cardId: number;
  front: string;
  back: string;
  /** Never reviewed by this student. */
  isNew: boolean;
  dueAt: string | null;
};

export type Queue = {
  /** All due cards (the list holds at most 200). */
  dueCount: number;
  /** New cards in this queue (at most 20 per school day). */
  newCount: number;
  cards: QueueCard[];
  /** When the next card becomes due, if none is due now. */
  nextDueAt: string | null;
};

export type RateResult = { cardId: number; rating: Rating; dueAt: string; intervalDays: number; ease: number; repetitions: number };

export function getQueue(): Promise<Queue> {
  return apiFetch("/api/reviews/queue");
}

export function rateCard(cardId: number, rating: Rating): Promise<RateResult> {
  return apiFetch("/api/reviews", { method: "POST", body: JSON.stringify({ cardId, rating }) });
}

/** The logged-in student's counters. */
export function getStudentProgress(): Promise<FlashcardProgress> {
  return apiFetch("/api/reviews/progress");
}
