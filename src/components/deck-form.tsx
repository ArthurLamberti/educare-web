"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveDeck, type FormState } from "@/app/decks/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

export function DeckForm({ deck }: { deck?: { id: number; title: string; description: string | null } }) {
  const [state, formAction, pending] = useActionState<FormState<"title" | "description">, FormData>(saveDeck.bind(null, deck?.id ?? null), {});
  const k = JSON.stringify(state.values ?? null);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <FormMessage message={state.message} />
      <Field label="Title" error={state.errors?.title}>
        <input name="title" required maxLength={200} defaultValue={state.values?.title ?? deck?.title ?? ""} key={`t-${k}`} className={inputClass} />
      </Field>
      <Field label="Description (optional)" error={state.errors?.description}>
        <textarea name="description" rows={3} maxLength={2000} defaultValue={state.values?.description ?? deck?.description ?? ""} key={`d-${k}`} className={inputClass} />
      </Field>
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : "Save"}
        </button>
        <Link href={deck ? `/decks/${deck.id}` : "/decks"} className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </Link>
      </div>
    </form>
  );
}
