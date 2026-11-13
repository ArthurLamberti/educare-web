"use server";

import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getQueue, rateCard, type Queue, type Rating, type RateResult } from "@/lib/reviews";

export type RateState = { result?: RateResult; message?: string };

/** Saves one rating; errors are returned so the card can stay on screen. */
export async function rateAction(cardId: number, rating: Rating): Promise<RateState> {
  await requireUser(["STUDENT"]);
  try {
    return { result: await rateCard(cardId, rating) };
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message };
    return { message: error instanceof Error ? error.message : "Não foi possível salvar a avaliação" };
  }
}

/** A fresh queue, when the session's local queue runs out. */
export async function queueAction(): Promise<Queue | { message: string }> {
  await requireUser(["STUDENT"]);
  try {
    return await getQueue();
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Não foi possível carregar os cartões" };
  }
}
