"use client";

import { useState, useTransition } from "react";

import { archiveTaskAction, deleteTaskAction, unassignAction, type ActionState } from "@/app/tasks/actions";

function useAction() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const run = (action: () => Promise<ActionState>) => startTransition(async () => setMessage((await action()).message));
  return { pending, message, run };
}

/** Archive/Unarchive always; Delete only when the task has no assignments. */
export function TaskActions({ id, archived, deletable }: { id: number; archived: boolean; deletable: boolean }) {
  const { pending, message, run } = useAction();
  const button = "rounded-md px-3 py-1.5 text-sm font-bold disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => archiveTaskAction(id, !archived))}
          className={`${button} text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800`}
        >
          {archived ? "Desarquivar" : "Arquivar"}
        </button>
        {deletable && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("Excluir esta tarefa? Não é possível desfazer.")) return;
              run(() => deleteTaskAction(id));
            }}
            className={`${button} text-red-600 hover:bg-red-50 dark:hover:bg-red-950`}
          >
            Excluir
          </button>
        )}
      </div>
      {message && <span role="alert" className="text-xs text-red-600">{message}</span>}
    </div>
  );
}

export function UnassignButton({ id, studentName }: { id: number; studentName: string }) {
  const { pending, message, run } = useAction();
  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Remover esta tarefa de ${studentName}?`)) return;
          run(() => unassignAction(id));
        }}
        className="text-sm font-bold text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Removendo..." : "Remover"}
      </button>
      {message && <span role="alert" className="text-xs text-red-600">{message}</span>}
    </span>
  );
}
