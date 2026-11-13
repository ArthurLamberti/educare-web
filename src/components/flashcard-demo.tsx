"use client";

import { useState } from "react";

type Rating = "De novo" | "Difícil" | "Bom" | "Fácil";

// Same first-review intervals the API scheduler gives a new card.
const NEXT: Record<Rating, string> = {
  "De novo": "daqui a 10 minutos",
  Difícil: "amanhã",
  Bom: "amanhã",
  Fácil: "daqui a 4 dias",
};

const CARD = {
  front: "Por que revisar um cartão em dias diferentes?",
  back: "Revisar logo antes de esquecer faz a memória durar mais. Assim você vê menos os cartões fáceis e mais os difíceis.",
};

/** A single flashcard to try on the landing page: reveal, rate, see when it comes back. */
export function FlashcardDemo() {
  const [revealed, setRevealed] = useState(false);
  const [rated, setRated] = useState<Rating>();

  function reset() {
    setRevealed(false);
    setRated(undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="index-card flex min-h-80 flex-col px-7 pb-7 text-left" aria-live="polite">
        <p className="flex h-[4.5rem] items-center font-display text-xl leading-snug font-semibold">{CARD.front}</p>
        {revealed ? (
          <p className="pt-[0.35rem] text-lg leading-7 text-ink-700 dark:text-ink-300">{CARD.back}</p>
        ) : (
          <div className="grid flex-1 place-items-center">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-md border border-brand-600 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-950"
            >
              Mostrar resposta
            </button>
          </div>
        )}
      </div>
      {revealed && !rated && (
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Quanto você lembrou?">
          {(Object.keys(NEXT) as Rating[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRated(r)}
              className="rounded-md border border-ink-300 bg-white py-2 text-sm font-bold hover:border-brand-500 hover:bg-brand-50 dark:border-ink-700 dark:bg-ink-900 dark:hover:bg-ink-800"
            >
              {r}
            </button>
          ))}
        </div>
      )}
      {rated && (
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Você escolheu {rated}: este cartão volta {NEXT[rated]}.{" "}
          <button type="button" onClick={reset} className="font-bold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300">
            Tentar de novo
          </button>
        </p>
      )}
    </div>
  );
}
