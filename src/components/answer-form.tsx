"use client";

import { useActionState } from "react";

import { submitAnswerAction, type AnswerFormState } from "@/app/assignments/actions";
import { FormMessage, primaryButtonClass } from "@/components/form-field";
import { MarkdownEditor } from "@/components/markdown-editor";

/** The student's answer: "Submit" the first time, "Update answer" until graded. */
export function AnswerForm({ id, answer, submitted }: { id: number; answer: string; submitted: boolean }) {
  const [state, formAction, pending] = useActionState<AnswerFormState, FormData>(submitAnswerAction.bind(null, id), {});
  const initial = state.values?.answer ?? answer;

  return (
    // Remount after each result, so the editor starts from the saved (or kept) text.
    <form action={formAction} className="flex flex-col gap-3" key={JSON.stringify(state)}>
      <FormMessage message={state.message} />
      {state.saved && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Answer saved. Your teacher will grade it.
        </p>
      )}
      <MarkdownEditor name="answer" label="Your answer" initial={initial} maxLength={20000} rows={12} warnUnsaved error={state.error} />
      <div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : submitted ? "Update answer" : "Submit"}
        </button>
      </div>
    </form>
  );
}
