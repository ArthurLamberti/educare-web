"use client";

import { useActionState } from "react";

import { submitAnswerAction, type AnswerFormState } from "@/app/assignments/actions";
import { FormMessage, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/form-field";
import { MarkdownEditor } from "@/components/markdown-editor";

/**
 * The student's answer, until graded: "Salvar rascunho" keeps it private, "Enviar" ("Reenviar" after
 * the first time) shows it to the teacher. `answer` is the text to start from (the draft, else the sent
 * answer); `draftSavedAt` is the draft's save time, already formatted. With `questions`, each one gets
 * its own field (`answers` start them, by position) and the general text becomes optional comments.
 */
export function AnswerForm({
  id,
  answer,
  questions = [],
  answers = [],
  submitted,
  draftSavedAt,
}: {
  id: number;
  answer: string;
  questions?: string[];
  answers?: string[];
  submitted: boolean;
  draftSavedAt?: string;
}) {
  const [state, formAction, pending] = useActionState<AnswerFormState, FormData>(submitAnswerAction.bind(null, id), {});
  const initial = state.values?.answer ?? answer;
  const initialAnswers = state.values?.answers ?? answers;

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
      {questions.map((prompt, i) => (
        <label key={i} className="flex flex-col gap-1.5 text-sm">
          <span className="font-bold whitespace-pre-wrap">
            {i + 1}. {prompt}
          </span>
          <textarea name="answers" defaultValue={initialAnswers[i] ?? ""} maxLength={5000} rows={3} className={inputClass} />
        </label>
      ))}
      <MarkdownEditor
        name="answer"
        label={questions.length > 0 ? "Comentários (opcional)" : "Sua resposta"}
        initial={initial}
        maxLength={20000}
        rows={questions.length > 0 ? 4 : 12}
        warnUnsaved
        required={false}
        error={state.error}
      />
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
