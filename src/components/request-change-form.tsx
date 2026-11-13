"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestChange, type RequestFormState } from "@/app/requests/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

export function RequestChangeForm({ lessonId, timeZone }: { lessonId: number; timeZone: string }) {
  const action = requestChange.bind(null, lessonId);
  const [state, formAction, pending] = useActionState<RequestFormState, FormData>(action, {});
  const k = JSON.stringify(state.values ?? null);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <FormMessage message={state.message} />

      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nova data">
            <input name="date" type="date" required defaultValue={state.values?.date} key={`d-${k}`} className={inputClass} />
          </Field>
          <Field label="Novo horário de início">
            <input name="time" type="time" required step={300} defaultValue={state.values?.time} key={`t-${k}`} className={inputClass} />
          </Field>
        </div>
        {state.errors?.proposedStartsAt && <span className="text-xs text-red-600">{state.errors.proposedStartsAt}</span>}
        <span className="text-xs text-ink-500">Horário da escola ({timeZone.replaceAll("_", " ")}). A aula mantém a duração.</span>
      </div>

      <Field label="Motivo (opcional)" error={state.errors?.reason}>
        <textarea name="reason" rows={3} maxLength={500} defaultValue={state.values?.reason} key={`r-${k}`} className={inputClass} />
      </Field>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Enviando..." : "Enviar pedido"}
        </button>
        <Link href="/lessons" className="rounded-md px-4 py-2 text-sm font-bold text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
          Voltar
        </Link>
      </div>
    </form>
  );
}
