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
  const button = "rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => archiveTaskAction(id, !archived))}
          className={`${button} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800`}
        >
          {archived ? "Unarchive" : "Archive"}
        </button>
        {deletable && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("Delete this task? This cannot be undone.")) return;
              run(() => deleteTaskAction(id));
            }}
            className={`${button} text-red-600 hover:bg-red-50 dark:hover:bg-red-950`}
          >
            Delete
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
          if (!window.confirm(`Remove this task from ${studentName}?`)) return;
          run(() => unassignAction(id));
        }}
        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Removing..." : "Unassign"}
      </button>
      {message && <span role="alert" className="text-xs text-red-600">{message}</span>}
    </span>
  );
}
