"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";

import { addCardAction, deleteCardAction, reorderCardsAction, updateCardAction, type FormState } from "@/app/decks/actions";
import { FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

type CardItem = { id: number; front: string; back: string };
type CardFormState = FormState<"front" | "back">;

const smallButton = "rounded px-2 py-1 text-xs font-medium hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800";

/**
 * The deck's cards: add (appended last), inline edit, delete, and move up/down. Reordering shows the new
 * order immediately; the server list replaces it after each action.
 */
export function CardEditor({ deckId, cards }: { deckId: number; cards: CardItem[] }) {
  const [ordered, setOrdered] = useOptimistic(cards);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  function move(index: number, delta: number) {
    const next = [...ordered];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    startTransition(async () => {
      setOrdered(next);
      setMessage((await reorderCardsAction(deckId, next.map((c) => c.id))).message);
    });
  }

  function remove(card: CardItem) {
    if (!window.confirm(`Delete the card "${card.front}"?`)) return;
    startTransition(async () => {
      setOrdered(ordered.filter((c) => c.id !== card.id));
      setMessage((await deleteCardAction(card.id)).message);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <FormMessage message={message} />
      {ordered.length === 0 ? (
        <p className="text-sm text-zinc-500">No cards yet. Add the first one below.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-900 dark:border-zinc-800">
          {ordered.map((card, index) => (
            <CardRow
              key={card.id}
              card={card}
              number={index + 1}
              busy={pending}
              onUp={index > 0 ? () => move(index, -1) : undefined}
              onDown={index < ordered.length - 1 ? () => move(index, 1) : undefined}
              onDelete={() => remove(card)}
            />
          ))}
        </ol>
      )}
      <AddCardForm deckId={deckId} />
    </div>
  );
}

function CardRow({
  card,
  number,
  busy,
  onUp,
  onDown,
  onDelete,
}: {
  card: CardItem;
  number: number;
  busy: boolean;
  onUp?: () => void;
  onDown?: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, saving] = useActionState<CardFormState, FormData>(async (prev, formData) => {
    const result = await updateCardAction(card.id, prev, formData);
    if (result.done) setEditing(false);
    return result;
  }, {});

  if (editing) {
    return (
      <li className="p-3">
        <form action={formAction} className="flex flex-col gap-2">
          <FormMessage message={state.message} />
          <CardFields values={state.values ?? card} errors={state.errors} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-3 text-sm text-zinc-500 hover:underline">
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 p-3 text-sm">
      <span className="w-6 pt-0.5 text-right text-xs text-zinc-400">{number}</span>
      <span className="grid flex-1 grid-cols-2 gap-4">
        <span className="font-medium break-words whitespace-pre-wrap">{card.front}</span>
        <span className="break-words whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">{card.back}</span>
      </span>
      <span className="flex shrink-0 gap-1">
        <button type="button" onClick={onUp} disabled={!onUp || busy} aria-label={`Move card ${number} up`} className={smallButton}>
          ↑
        </button>
        <button type="button" onClick={onDown} disabled={!onDown || busy} aria-label={`Move card ${number} down`} className={smallButton}>
          ↓
        </button>
        <button type="button" onClick={() => setEditing(true)} className={`${smallButton} text-indigo-600`}>
          Edit
        </button>
        <button type="button" onClick={onDelete} disabled={busy} className={`${smallButton} text-red-600`}>
          Delete
        </button>
      </span>
    </li>
  );
}

function CardFields({ values, errors }: { values: { front: string; back: string }; errors?: Partial<Record<"front" | "back", string>> }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Front
        <textarea name="front" required maxLength={1000} rows={2} defaultValue={values.front} className={inputClass} />
        {errors?.front && <span className="text-xs font-normal text-red-600">{errors.front}</span>}
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Back
        <textarea name="back" required maxLength={1000} rows={2} defaultValue={values.back} className={inputClass} />
        {errors?.back && <span className="text-xs font-normal text-red-600">{errors.back}</span>}
      </label>
    </div>
  );
}

function AddCardForm({ deckId }: { deckId: number }) {
  const [state, formAction, pending] = useActionState<CardFormState, FormData>(addCardAction.bind(null, deckId), {});
  return (
    // Remount after each result: cleared after success, typed values kept after an error.
    <form action={formAction} className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900" key={JSON.stringify(state)}>
      <h3 className="text-sm font-semibold">Add a card</h3>
      <FormMessage message={state.message} />
      <CardFields values={state.values ?? { front: "", back: "" }} errors={state.errors} />
      <div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}
