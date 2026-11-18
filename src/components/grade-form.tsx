"use client";

import Link from "next/link";
import { useActionState } from "react";

import { gradeAction, type GradeFormState } from "@/app/assignments/actions";
import { Field, FormMessage, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/form-field";
import { MarkdownEditor } from "@/components/markdown-editor";

/**
 * Score (0-10, one decimal) and Markdown feedback; `version` is the answer version shown on the page.
 * "Salvar correção" keeps it private (either field may be empty); "Enviar correção" publishes it.
 * `score`/`feedback` start the form (the saved correction, else the published grade); `graded` tells
 * whether a grade was already published.
 */
export function GradeForm({
  id,
  version,
  score,
  feedback,
  graded,
}: {
  id: number;
  version: number;
  score?: number | null;
  feedback?: string | null;
  graded: boolean;
}) {
  const [state, formAction, pending] = useActionState<GradeFormState, FormData>(gradeAction.bind(null, id, version), {});
  // After "Reload" the page passes the new version: the warning goes away, typed values stay.
  const stale = state.staleVersion !== undefined && state.staleVersion === version;
  const reloaded = state.staleVersion !== undefined && !stale;

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4" key={JSON.stringify(state.values ?? null)}>
      {stale ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {state.message}
          <Link href={`/grading/${id}`} className="font-bold underline">
            Recarregar
          </Link>
        </div>
      ) : (
        <FormMessage message={reloaded ? undefined : state.message} />
      )}
      {state.drafted && (
        <p role="status" className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950 dark:text-sky-300">
          Correção salva. O aluno só vê quando você enviar.
        </p>
      )}
      <Field label="Nota (0-10)" error={state.errors?.score}>
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
      <MarkdownEditor
        name="feedback"
        label="Comentário"
        initial={state.values?.feedback ?? feedback ?? ""}
        maxLength={10000}
        rows={8}
        error={state.errors?.feedback}
      />
      <div className="flex flex-wrap gap-3">
        <button type="submit" name="intent" value="send" disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando..." : graded ? "Enviar nova correção" : "Enviar correção"}
        </button>
        {/* A draft may be incomplete: skip the browser's required checks. */}
        <button type="submit" name="intent" value="draft" formNoValidate disabled={pending} className={secondaryButtonClass}>
          Salvar correção
        </button>
        <Link href="/grading" className="rounded-md px-4 py-2 text-sm font-bold text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
          Voltar para a fila
        </Link>
      </div>
    </form>
  );
}
