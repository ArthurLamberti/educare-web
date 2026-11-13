"use client";

import { useState, useTransition } from "react";

import { endSeriesAction } from "@/app/lessons/actions";

/**
 * Ends a recurring series: cancels its lessons from `from` (school date, yyyy-MM-dd; default today)
 * and stops creating new ones. Lessons before that date stay as they are.
 */
export function EndSeriesButton({ seriesId, from, label, confirmText }: { seriesId: number; from?: string; label: string; confirmText: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(confirmText)) return;
          startTransition(async () => setError((await endSeriesAction(seriesId, from)).message));
        }}
        className="text-sm font-bold text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Encerrando..." : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
