"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";

import { queueAction, rateAction } from "@/app/study/actions";
import { FormMessage } from "@/components/form-field";
import { formatDateTime } from "@/lib/datetime";
import type { Queue, QueueCard, Rating } from "@/lib/reviews";

const RATINGS: { rating: Rating; label: string; key: string; className: string }[] = [
  { rating: "AGAIN", label: "Again", key: "1", className: "bg-red-600 hover:bg-red-500" },
  { rating: "HARD", label: "Hard", key: "2", className: "bg-amber-600 hover:bg-amber-500" },
  { rating: "GOOD", label: "Good", key: "3", className: "bg-green-600 hover:bg-green-500" },
  { rating: "EASY", label: "Easy", key: "4", className: "bg-sky-600 hover:bg-sky-500" },
];

/**
 * One card at a time: front, "Show answer" (Space), then Again/Hard/Good/Easy (1-4). Each rating is saved
 * before the next card shows; a failed save keeps the card. Cards rated Again go back to the end of the
 * session. When the local queue runs out, a fresh queue is fetched (it brings any card due by then).
 */
export function StudySession({ initial, deckId, timeZone }: { initial: Queue; deckId: number | null; timeZone: string }) {
  const [queue, setQueue] = useState<QueueCard[]>(initial.cards);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [nextDueAt, setNextDueAt] = useState(initial.nextDueAt);
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const card = queue[0];

  const rate = useCallback(
    (rating: Rating) => {
      if (!card || !revealed || pending) return;
      startTransition(async () => {
        const { result, message } = await rateAction(card.cardId, rating);
        if (!result) {
          setMessage(message ?? "Could not save the rating");
          return;
        }
        setMessage(undefined);
        setReviewed((n) => n + 1);
        setRevealed(false);
        let rest = queue.slice(1);
        if (rating === "AGAIN") rest = [...rest, { ...card, isNew: false, dueAt: result.dueAt }];
        if (rest.length === 0) {
          const fresh = await queueAction(deckId);
          if ("message" in fresh) setMessage(fresh.message);
          else {
            rest = fresh.cards;
            setNextDueAt(fresh.nextDueAt);
          }
        }
        setQueue(rest);
      });
    },
    [card, revealed, pending, queue, deckId],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select")) return;
      if (event.key === " " && card && !revealed) {
        event.preventDefault();
        setRevealed(true);
      } else if (revealed) {
        const match = RATINGS.find((r) => r.key === event.key);
        if (match) {
          event.preventDefault();
          rate(match.rating);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, rate]);

  if (!card) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 p-10 text-center dark:border-zinc-800">
        <h2 className="text-xl font-semibold">All done for today</h2>
        {reviewed > 0 && <p>Session finished: {reviewed} {reviewed === 1 ? "review" : "reviews"}.</p>}
        <p className="text-sm text-zinc-500">
          {nextDueAt ? `Next card due ${formatDateTime(nextDueAt, timeZone)}.` : "No cards scheduled yet."}
        </p>
        <FormMessage message={message} />
        <Link href="/decks" className="text-sm font-medium text-indigo-600 hover:underline">
          Back to flashcards
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          {queue.length} remaining · {reviewed} reviewed
        </span>
        <span>
          {card.deckTitle}
          {card.isNew && <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">New</span>}
        </span>
      </div>

      <div className="flex min-h-64 flex-col items-center justify-center gap-6 rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-800" aria-live="polite">
        <p className="text-2xl font-semibold break-words whitespace-pre-wrap">{card.front}</p>
        {revealed && (
          <>
            <hr className="w-full border-zinc-200 dark:border-zinc-800" />
            <p className="text-xl break-words whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{card.back}</p>
          </>
        )}
      </div>

      <FormMessage message={message && `${message}. Try again.`} />

      {revealed ? (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.rating}
              type="button"
              disabled={pending}
              onClick={() => rate(r.rating)}
              aria-keyshortcuts={r.key}
              className={`rounded-md px-3 py-3 text-sm font-medium text-white disabled:opacity-50 ${r.className}`}
            >
              {r.label} <kbd className="ml-1 text-xs opacity-75">{r.key}</kbd>
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          autoFocus
          onClick={() => setRevealed(true)}
          aria-keyshortcuts="Space"
          className="rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Show answer <kbd className="ml-1 text-xs opacity-75">Space</kbd>
        </button>
      )}
    </div>
  );
}
