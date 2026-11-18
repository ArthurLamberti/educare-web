"use client";

import { useActionState } from "react";

import { submitAnswerAction, type AnswerFormState } from "@/app/assignments/actions";
import { FormMessage, primaryButtonClass, secondaryButtonClass } from "@/components/form-field";
import { MarkdownEditor } from "@/components/markdown-editor";

/**
 * The student's answer, until graded: "Salvar rascunho" keeps it private, "Enviar" ("Reenviar" after
 * the first time) shows it to the teacher. `answer` is the text to start from (the draft, else the sent
 * answer); `draftSavedAt` is the draft's save time, already formatted.
 */
export function AnswerForm({
  id,
  answer,
  submitted,
  draftSavedAt,
}: {
  id: number;
  answer: string;
  submitted: boolean;
  draftSavedAt?: string;
}) {
  const [state, formAction, pending] = useActionState<AnswerFormState, FormData>(submitAnswerAction.bind(null, id), {});
  const initial = state.values?.answer ?? answer;

  return (
    // Remount after each result, so the editor starts from the saved (or kept) text.
    <form action={formAction} className="flex flex-col gap-3" key={`${state.done ?? 0}-${state.values ? "kept" : "saved"}`}>
      <FormMessage message={state.message} />
      {state.saved === "sent" && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Resposta enviada. Seu professor vai corrigir.
        </p>
      )}
      {state.saved === "draft" && (
        <p role="status" className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950 dark:text-sky-300">
          Rascunho salvo. Seu professor ainda não vê este texto.
        </p>
      )}
      {draftSavedAt && !state.saved && (
        <p className="text-sm text-ink-500">
          Rascunho salvo em {draftSavedAt}. {submitted ? "Seu professor continua vendo a resposta enviada até você reenviar." : "Seu professor ainda não vê este texto."}
        </p>
      )}
      <MarkdownEditor name="answer" label="Sua resposta" initial={initial} maxLength={20000} rows={12} warnUnsaved required={false} error={state.error} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" name="intent" value="send" disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando..." : submitted ? "Reenviar" : "Enviar"}
        </button>
        <button type="submit" name="intent" value="draft" disabled={pending} className={secondaryButtonClass}>
          Salvar rascunho
        </button>
      </div>
    </form>
  );
}
