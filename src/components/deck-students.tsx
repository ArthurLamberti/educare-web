"use client";

import { useActionState, useState, useTransition } from "react";

import { proposeDeckAction, removeDeckStudentAction, type FormState } from "@/app/decks/actions";
import { FormMessage, primaryButtonClass } from "@/components/form-field";

type Option = { id: number; name: string };

/** Students who have the deck (with Remove) and, unless archived, a picker of the teacher's other students. */
export function DeckStudents({
  deckId,
  students,
  available,
  archived,
}: {
  deckId: number;
  students: { studentId: number; name: string }[];
  available: Option[];
  archived: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState<"studentIds">, FormData>(proposeDeckAction.bind(null, deckId), {});
  const [removing, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  return (
    <div className="flex flex-col gap-4">
      <FormMessage message={message} />
      {students.length === 0 ? (
        <p className="text-sm text-zinc-500">Not proposed to any student yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-100 text-sm dark:divide-zinc-900">
          {students.map((s) => (
            <li key={s.studentId} className="flex items-center justify-between py-2">
              {s.name}
              <button
                type="button"
                disabled={removing}
                onClick={() => {
                  if (!window.confirm(`Remove this deck from ${s.name}? Their review progress is kept.`)) return;
                  startTransition(async () => setMessage((await removeDeckStudentAction(deckId, s.studentId)).message));
                }}
                className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {archived ? (
        <p className="text-sm text-zinc-500">Archived decks cannot be proposed to more students.</p>
      ) : available.length > 0 ? (
        <form action={formAction} className="flex flex-col gap-2" key={state.done ?? 0}>
          <FormMessage message={state.message} />
          <fieldset className="flex flex-col gap-1 text-sm">
            <legend className="mb-1 font-medium">Propose to</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {available.map((s) => (
                <label key={s.id} className="flex items-center gap-2">
                  <input type="checkbox" name="studentIds" value={s.id} />
                  {s.name}
                </label>
              ))}
            </div>
            {state.errors?.studentIds && <span className="text-xs text-red-600">{state.errors.studentIds}</span>}
          </fieldset>
          <div>
            <button type="submit" disabled={pending} className={primaryButtonClass}>
              {pending ? "Proposing..." : "Propose deck"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-zinc-500">All your active students have this deck.</p>
      )}
    </div>
  );
}
