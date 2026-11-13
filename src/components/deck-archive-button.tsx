"use client";

import { useState, useTransition } from "react";

import { archiveDeckAction } from "@/app/decks/actions";

export function DeckArchiveButton({ id, archived }: { id: number; archived: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => setMessage((await archiveDeckAction(id, !archived)).message))}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {archived ? "Unarchive" : "Archive"}
      </button>
      {message && <span role="alert" className="text-xs text-red-600">{message}</span>}
    </span>
  );
}
