"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";

import { addCardAction, deleteCardAction, updateCardAction, type FormState } from "@/app/flashcards/actions";
import { FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";
import { formatDay } from "@/lib/datetime";

export type CardItem = { id: number; front: string; back: string; stage: string; dueAt: string | null };
type CardFormState = FormState<"front" | "back">;

const smallButton = "rounded px-2 py-1 text-xs font-bold hover:bg-ink-100 disabled:opacity-30 dark:hover:bg-ink-800";

/**
 * A student's words: edit inline (progress is kept) and delete. With `editable` false
 * (admins, the student) the list is read-only.
 */
export function CardEditor({ cards, timeZone, editable }: { cards: CardItem[]; timeZone: string; editable: boolean }) {
  const [list, removeOptimistic] = useOptimistic(cards, (current, id: number) => current.filter((c) => c.id !== id));
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  function remove(card: CardItem) {
    if (!window.confirm(`Excluir a palavra "${card.front}"? O histórico de revisão dela também é apagado.`)) return;
    startTransition(async () => {
      removeOptimistic(card.id);
      setMessage((await deleteCardAction(card.id)).message);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <FormMessage message={message} />
      {list.length === 0 ? (
        <p className="text-sm text-ink-500">Nenhuma palavra ainda.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-ink-100 rounded-lg border border-ink-200 bg-white dark:divide-ink-800 dark:border-ink-800 dark:bg-ink-900">
          {list.map((card) => (
            <CardRow key={card.id} card={card} timeZone={timeZone} editable={editable} busy={pending} onDelete={() => remove(card)} />
          ))}
        </ol>
      )}
    </div>
  );
}

function CardRow({ card, timeZone, editable, busy, onDelete }: { card: CardItem; timeZone: string; editable: boolean; busy: boolean; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, saving] = useActionState<CardFormState, FormData>(async (prev, formData) => {
    const result = await updateCardAction(card.id, prev, formData);
    if (result.done) setEditing(false);
    return result;
  }, {});

  if (editing) {
    return (
      <li className="p-3">
        <form action={formAction} className="flex flex-col gap-2">
          <FormMessage message={state.message} />
          <CardFields values={state.values ?? card} errors={state.errors} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-3 text-sm text-ink-500 hover:underline">
              Cancelar
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-1 p-3 text-sm">
      <span className="grid min-w-0 flex-1 grid-cols-2 gap-4">
        <span className="font-bold break-words whitespace-pre-wrap">{card.front}</span>
        <span className="break-words whitespace-pre-wrap text-ink-600 dark:text-ink-400">{card.back}</span>
      </span>
      <span className="w-40 text-xs text-ink-500">
        {card.stage}
        {card.dueAt && <span className="block">revisão: {formatDay(card.dueAt, timeZone)}</span>}
      </span>
      {editable && (
        <span className="flex shrink-0 gap-1">
          <button type="button" onClick={() => setEditing(true)} className={`${smallButton} text-brand-600`}>
            Editar
          </button>
          <button type="button" onClick={onDelete} disabled={busy} className={`${smallButton} text-red-600`}>
            Excluir
          </button>
        </span>
      )}
    </li>
  );
}

function CardFields({ values, errors }: { values: { front: string; back: string }; errors?: Partial<Record<"front" | "back", string>> }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1 text-sm font-bold">
        Palavra
        <textarea name="front" required maxLength={1000} rows={2} defaultValue={values.front} className={inputClass} />
        {errors?.front && <span className="text-xs font-normal text-red-600">{errors.front}</span>}
      </label>
      <label className="flex flex-col gap-1 text-sm font-bold">
        Tradução
        <textarea name="back" required maxLength={1000} rows={2} defaultValue={values.back} className={inputClass} />
        {errors?.back && <span className="text-xs font-normal text-red-600">{errors.back}</span>}
      </label>
    </div>
  );
}

/** One word at a time. */
export function AddCardForm({ studentId }: { studentId: number }) {
  const [state, formAction, pending] = useActionState<CardFormState, FormData>(addCardAction.bind(null, studentId), {});
  return (
    // Remount after each result: cleared after success, typed values kept after an error.
    <form action={formAction} className="flex flex-col gap-2 rounded-lg bg-ink-50 p-3 dark:bg-ink-900" key={JSON.stringify(state)}>
      <h3 className="text-sm font-semibold">Adicionar palavra</h3>
      <FormMessage message={state.message} />
      <CardFields values={state.values ?? { front: "", back: "" }} errors={state.errors} />
      <div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Adicionando..." : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
