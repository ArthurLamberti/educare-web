import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";

export type Deck = {
  id: number;
  title: string;
  description: string | null;
  archived: boolean;
  teacherId: number;
  teacherName: string;
  cardCount: number;
  /** Students the deck is proposed to; null for students. */
  studentCount: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Card = {
  id: number;
  deckId: number;
  front: string;
  back: string;
  /** 0-based */
  position: number;
  updatedAt: string;
};

export type DeckStudent = { studentId: number; name: string; assignedAt: string };

/** Teachers: own decks; students: decks proposed to them; admins: all. Newest first. */
export async function listDecks(query: { includeArchived?: boolean; page?: number; size?: number } = {}): Promise<Page<Deck>> {
  const params = new URLSearchParams({ page: String(query.page ?? 0), size: String(query.size ?? 20) });
  if (query.includeArchived) params.set("includeArchived", "true");
  return normalizePage(await apiFetch(`/api/decks?${params}`));
}

export function getDeck(id: number): Promise<Deck> {
  return apiFetch(`/api/decks/${id}`);
}

export function createDeck(data: { title: string; description: string | null }): Promise<Deck> {
  return apiFetch("/api/decks", { method: "POST", body: JSON.stringify(data) });
}

export function updateDeck(id: number, data: { title: string; description: string | null }): Promise<Deck> {
  return apiFetch(`/api/decks/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function setDeckArchived(id: number, archived: boolean): Promise<Deck> {
  return apiFetch(`/api/decks/${id}/${archived ? "archive" : "unarchive"}`, { method: "POST" });
}

/** In deck order. */
export function listCards(deckId: number): Promise<Card[]> {
  return apiFetch(`/api/decks/${deckId}/cards`);
}

export function addCard(deckId: number, data: { front: string; back: string }): Promise<Card> {
  return apiFetch(`/api/decks/${deckId}/cards`, { method: "POST", body: JSON.stringify(data) });
}

export function updateCard(id: number, data: { front: string; back: string }): Promise<Card> {
  return apiFetch(`/api/cards/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteCard(id: number): Promise<void> {
  return apiFetch(`/api/cards/${id}`, { method: "DELETE" });
}

/** `cardIds` must be every card of the deck, once each. */
export function reorderCards(deckId: number, cardIds: number[]): Promise<Card[]> {
  return apiFetch(`/api/decks/${deckId}/cards/order`, { method: "PUT", body: JSON.stringify({ cardIds }) });
}

export function listDeckStudents(deckId: number): Promise<DeckStudent[]> {
  return apiFetch(`/api/decks/${deckId}/students`);
}

/** Idempotent: students who already have the deck are skipped. */
export function proposeDeck(deckId: number, studentIds: number[]): Promise<DeckStudent[]> {
  return apiFetch(`/api/decks/${deckId}/students`, { method: "POST", body: JSON.stringify({ studentIds }) });
}

export function removeDeckStudent(deckId: number, studentId: number): Promise<void> {
  return apiFetch(`/api/decks/${deckId}/students/${studentId}`, { method: "DELETE" });
}
