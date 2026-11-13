"use client";

import { useState, useTransition } from "react";

import { changeSpaceStatus } from "@/app/admin/actions";

/** "Liberar"/"Reativar" act at once; "Suspender" asks again inline (it blocks everyone in the space). */
export function SpaceStatusButton({ id, action, label }: { id: number; action: "activate" | "suspend"; label: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const run = () =>
    startTransition(async () => {
      setError(await changeSpaceStatus(id, action));
      setConfirming(false);
    });

  if (action === "suspend" && confirming) {
    return (
      <span className="flex items-center gap-3 text-sm">
        <span className="text-ink-600 dark:text-ink-400">Suspender o acesso?</span>
        <button type="button" disabled={pending} onClick={run} className="font-bold text-red-600 hover:underline disabled:opacity-50">
          {pending ? "Salvando..." : "Sim, suspender"}
        </button>
        <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="font-bold text-ink-600 hover:underline dark:text-ink-300">
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={action === "suspend" ? () => setConfirming(true) : run}
        className={
          action === "activate"
            ? "rounded-md bg-brand-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-500 disabled:opacity-50"
            : "text-sm font-bold text-red-600 hover:underline disabled:opacity-50"
        }
      >
        {pending ? "Salvando..." : label}
      </button>
      {error && <span className="text-xs text-pen">{error}</span>}
    </span>
  );
}
