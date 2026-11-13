"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveTask, type TaskFormState } from "@/app/tasks/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";
import { Markdown } from "@/components/markdown";

/** Title and Markdown instructions, with a Write/Preview switch. */
export function TaskForm({ task }: { task?: { id: number; title: string; instructions: string } }) {
  const [state, formAction, pending] = useActionState<TaskFormState, FormData>(saveTask.bind(null, task?.id ?? null), {});
  const [instructions, setInstructions] = useState(task?.instructions ?? "");
  const [preview, setPreview] = useState(false);
  const title = state.values?.title ?? task?.title ?? "";

  const tab = (active: boolean) =>
    `rounded-md px-3 py-1 text-xs font-medium ${active ? "bg-zinc-200 dark:bg-zinc-700" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`;

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <FormMessage message={state.message} />

      <Field label="Title" error={state.errors?.title}>
        <input name="title" required maxLength={200} defaultValue={title} key={`t-${title}`} className={inputClass} />
      </Field>

      <div className="flex flex-col gap-1 text-sm font-medium">
        <div className="flex items-center gap-2">
          <span id="instructions-label">Instructions</span>
          <span className="ml-auto flex gap-1" role="tablist">
            <button type="button" role="tab" aria-selected={!preview} onClick={() => setPreview(false)} className={tab(!preview)}>
              Write
            </button>
            <button type="button" role="tab" aria-selected={preview} onClick={() => setPreview(true)} className={tab(preview)}>
              Preview
            </button>
          </span>
        </div>
        {/* The textarea stays mounted (hidden in preview) so its value is always submitted. */}
        <textarea
          name="instructions"
          aria-labelledby="instructions-label"
          required
          maxLength={10000}
          rows={12}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          hidden={preview}
          className={`${inputClass} font-mono`}
        />
        {preview && (
          <div className="min-h-48 rounded-md border border-zinc-300 px-3 py-2 font-normal dark:border-zinc-700">
            {instructions.trim() ? <Markdown>{instructions}</Markdown> : <p className="text-zinc-500">Nothing to preview.</p>}
          </div>
        )}
        {state.errors?.instructions && <span className="text-xs font-normal text-red-600">{state.errors.instructions}</span>}
        <span className="text-xs font-normal text-zinc-500">
          Markdown: **bold**, *italic*, lists with &quot;- &quot;, links [text](https://…). HTML is shown as text. {instructions.length}/10000
        </span>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : "Save"}
        </button>
        <Link href={task ? `/tasks/${task.id}` : "/tasks"} className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </Link>
      </div>
    </form>
  );
}
