"use client";

import Link from "next/link";
import { useActionState } from "react";

import { gradeAction, type GradeFormState } from "@/app/assignments/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";
import { MarkdownEditor } from "@/components/markdown-editor";

/** Score (0-10, one decimal) and Markdown feedback; `version` is the answer version shown on the page. */
export function GradeForm({ id, version, score, feedback }: { id: number; version: number; score?: number; feedback?: string }) {
  const [state, formAction, pending] = useActionState<GradeFormState, FormData>(gradeAction.bind(null, id, version), {});
  // After "Reload" the page passes the new version: the warning goes away, typed values stay.
  const stale = state.staleVersion !== undefined && state.staleVersion === version;
  const reloaded = state.staleVersion !== undefined && !stale;

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4" key={JSON.stringify(state.values ?? null)}>
      {stale ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {state.message}
          <Link href={`/grading/${id}`} className="font-medium underline">
            Reload
          </Link>
        </div>
      ) : (
        <FormMessage message={reloaded ? undefined : state.message} />
      )}
      <Field label="Score (0-10)" error={state.errors?.score}>
        <input
          name="score"
          type="number"
          required
          min={0}
          max={10}
          step={0.1}
          inputMode="decimal"
          defaultValue={state.values?.score ?? score ?? ""}
          className={`${inputClass} max-w-32`}
        />
      </Field>
      <MarkdownEditor name="feedback" label="Feedback" initial={state.values?.feedback ?? feedback ?? ""} maxLength={10000} rows={8} error={state.errors?.feedback} />
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : score === undefined ? "Save grade" : "Update grade"}
        </button>
        <Link href="/grading" className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Back to queue
        </Link>
      </div>
    </form>
  );
}
