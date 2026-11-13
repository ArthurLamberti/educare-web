"use client";

import { useActionState } from "react";

import { assignTaskAction, type AssignFormState } from "@/app/tasks/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

/** Choose students (checkboxes) and an optional due date in the school's time zone. */
export function AssignForm({ taskId, students, timeZone }: { taskId: number; students: { id: number; name: string }[]; timeZone: string }) {
  const [state, formAction, pending] = useActionState<AssignFormState, FormData>(assignTaskAction.bind(null, taskId), {});
  const selected = new Set(state.values?.studentIds ?? []);
  // Remount after each result: keeps the selection after an error, clears it after success.
  const k = JSON.stringify(state);

  return (
    <form action={formAction} className="flex flex-col gap-4" key={k}>
      <FormMessage message={state.message} />
      {state.assigned !== undefined && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Atribuída a {state.assigned} {state.assigned === 1 ? "aluno" : "alunos"}.
        </p>
      )}

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1 font-bold">Alunos</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
          {students.map((s) => (
            <label key={s.id} className="flex items-center gap-2">
              <input type="checkbox" name="studentIds" value={s.id} defaultChecked={selected.has(String(s.id))} />
              {s.name}
            </label>
          ))}
        </div>
        {state.errors?.studentIds && <span className="text-xs text-red-600">{state.errors.studentIds}</span>}
      </fieldset>

      <div className="flex flex-col gap-1">
        <div className="grid max-w-md grid-cols-2 gap-4">
          <Field label="Data de entrega (opcional)">
            <input name="date" type="date" defaultValue={state.values?.date ?? ""} className={inputClass} />
          </Field>
          <Field label="Horário de entrega">
            <input name="time" type="time" step={300} defaultValue={state.values?.time ?? "23:59"} className={inputClass} />
          </Field>
        </div>
        {state.errors?.dueAt && <span className="text-xs text-red-600">{state.errors.dueAt}</span>}
        <span className="text-xs text-ink-500">Horário da escola ({timeZone.replaceAll("_", " ")}). Deixe a data vazia para não ter prazo.</span>
      </div>

      <div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Atribuindo..." : "Atribuir"}
        </button>
      </div>
    </form>
  );
}
