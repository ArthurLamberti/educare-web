"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";

import { queueAction, rateAction } from "@/app/study/actions";
import { FormMessage } from "@/components/form-field";
import { formatDateTime } from "@/lib/datetime";
import type { Queue, QueueCard, Rating } from "@/lib/reviews";

const RATINGS: { rating: Rating; label: string; key: string; className: string }[] = [
  { rating: "AGAIN", label: "De novo", key: "1", className: "bg-pen hover:bg-red-600" },
  { rating: "HARD", label: "Difícil", key: "2", className: "bg-amber-700 hover:bg-amber-600" },
  { rating: "GOOD", label: "Bom", key: "3", className: "bg-brand-600 hover:bg-brand-500" },
  { rating: "EASY", label: "Fácil", key: "4", className: "bg-sky-700 hover:bg-sky-600" },
];

/**
 * One card at a time: front, "Show answer" (Space), then Again/Hard/Good/Easy (1-4). Each rating is saved
 * before the next card shows; a failed save keeps the card. Cards rated Again go back to the end of the
 * session. When the local queue runs out, a fresh queue is fetched (it brings any card due by then).
 */
export function StudySession({ initial, timeZone }: { initial: Queue; timeZone: string }) {
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
          setMessage(message ?? "Não foi possível salvar a avaliação");
          return;
        }
        setMessage(undefined);
        setReviewed((n) => n + 1);
        setRevealed(false);
        let rest = queue.slice(1);
        if (rating === "AGAIN") rest = [...rest, { ...card, isNew: false, dueAt: result.dueAt }];
        if (rest.length === 0) {
          const fresh = await queueAction();
          if ("message" in fresh) setMessage(fresh.message);
          else {
            rest = fresh.cards;
            setNextDueAt(fresh.nextDueAt);
          }
        }
        setQueue(rest);
      });
    },
    [card, revealed, pending, queue],
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
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-md border border-ink-200 bg-white p-10 text-center dark:border-ink-800 dark:bg-ink-900">
        <h2 className="text-2xl">Tudo feito por hoje</h2>
        {reviewed > 0 && <p>Sessão concluída: {reviewed} {reviewed === 1 ? "revisão" : "revisões"}.</p>}
        <p className="text-sm text-ink-500">
          {nextDueAt ? `Próximo cartão em ${formatDateTime(nextDueAt, timeZone)}.` : "Nenhum cartão agendado ainda."}
        </p>
        <FormMessage message={message} />
        <Link href="/flashcards" className="text-sm font-bold text-brand-600 hover:underline">
          Voltar aos flashcards
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-ink-500">
        <span className="tabular-nums">
          {queue.length} {queue.length === 1 ? "restante" : "restantes"}, {reviewed} {reviewed === 1 ? "revisado" : "revisados"}
        </span>
        <span>
          {card.isNew && <span className="ml-2 rounded-sm bg-highlight px-1.5 py-0.5 text-xs font-bold text-ink-900 dark:bg-brand-950 dark:text-brand-300">Novo</span>}
        </span>
      </div>

      <div key={card.cardId} className="index-card flex min-h-80 flex-col px-8 pb-8" aria-live="polite">
        <p className="flex min-h-[4.5rem] items-center py-3 font-display text-2xl leading-tight font-semibold break-words whitespace-pre-wrap">
          {card.front}
        </p>
        {revealed && <p className="pt-[0.35rem] text-xl leading-7 break-words whitespace-pre-wrap text-ink-700 dark:text-ink-300">{card.back}</p>}
      </div>

      <FormMessage message={message && `${message}. Tente de novo.`} />

      {revealed ? (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.rating}
              type="button"
              disabled={pending}
              onClick={() => rate(r.rating)}
              aria-keyshortcuts={r.key}
              className={`rounded-md px-3 py-3 text-sm font-bold text-white disabled:opacity-50 ${r.className}`}
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
          className="rounded-md bg-brand-600 px-4 py-3 text-sm font-bold text-white hover:bg-brand-500"
        >
          Mostrar resposta <kbd className="ml-1 text-xs opacity-75">Espaço</kbd>
        </button>
      )}
    </div>
  );
}
