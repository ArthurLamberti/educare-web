"use client";

import { useActionState, useState } from "react";

import { addCardsAction, type BatchState } from "@/app/flashcards/actions";
import { FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";
import { MAX_BATCH, parseCardLines } from "@/lib/card-lines";

const EXAMPLE = "to go;ir\nto eat;comer\nhouse;casa";

/** Paste one "palavra;tradução" per line; shows what will be added before saving. */
export function BulkCardForm({ studentId }: { studentId: number }) {
  const [state, formAction, pending] = useActionState<BatchState, FormData>(addCardsAction.bind(null, studentId), {});
  return (
    // Remount after each result: empty after success, the pasted text kept after an error.
    <BulkFields key={state.done ?? 0} state={state} formAction={formAction} pending={pending} />
  );
}

function BulkFields({ state, formAction, pending }: { state: BatchState; formAction: (data: FormData) => void; pending: boolean }) {
  const [text, setText] = useState(state.text ?? "");
  const parsed = parseCardLines(text);
  const count = parsed.cards.length;
  const ready = count > 0 && parsed.errors.length === 0;
  const errors = text === state.text && state.errors?.length ? state.errors : parsed.errors;

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-lg bg-ink-50 p-3 dark:bg-ink-900">
      <h3 className="text-sm font-semibold">Adicionar várias palavras</h3>
      <p className="text-xs text-ink-500">
        Uma por linha, no formato <code className="font-mono">palavra;tradução</code>. Até {MAX_BATCH} por vez; se alguma linha tiver
        problema, nenhuma é salva.
      </p>
      {state.added !== undefined && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          {state.added} {state.added === 1 ? "palavra adicionada" : "palavras adicionadas"} à lista.
        </p>
      )}
      <FormMessage message={state.message} />
      <textarea
        name="lines"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={EXAMPLE}
        aria-label="Palavras, uma por linha no formato palavra;tradução"
        aria-describedby="bulk-errors"
        className={`${inputClass} font-mono`}
      />
      {errors.length > 0 && (
        <ul id="bulk-errors" className="flex flex-col gap-0.5 text-xs text-pen">
          {errors.slice(0, 10).map((e) => (
            <li key={e}>{e}</li>
          ))}
          {errors.length > 10 && <li>e mais {errors.length - 10} {errors.length - 10 === 1 ? "problema" : "problemas"}.</li>}
        </ul>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending || !ready} className={primaryButtonClass}>
          {pending ? "Adicionando..." : count > 0 ? `Adicionar ${count} ${count === 1 ? "palavra" : "palavras"}` : "Adicionar palavras"}
        </button>
        {count > 0 && parsed.errors.length > 0 && (
          <span className="text-xs text-ink-500">Corrija as linhas acima para adicionar.</span>
        )}
      </div>
    </form>
  );
}
