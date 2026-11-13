"use client";

import { useActionState, useState } from "react";

import { saveSettings, type SettingsState } from "@/app/settings/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";
import { TimeZoneSelect } from "@/components/time-zone-select";
import type { TimeZoneOptions } from "@/lib/time-zones";

export function SettingsForm({
  name,
  timeZone,
  place,
  timeZones,
}: {
  name: string;
  timeZone: string;
  /** "escola" or "espaço" */
  place: string;
  timeZones: TimeZoneOptions;
}) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(saveSettings, {});
  const [zone, setZone] = useState(state.values?.timeZone ?? timeZone);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <FormMessage message={state.message} />
      {state.saved && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Configurações salvas.
        </p>
      )}
      <Field label={place === "espaço" ? "Nome do espaço" : "Nome da escola"} error={state.errors?.name}>
        <input name="name" required maxLength={150} defaultValue={state.values?.name ?? name} className={inputClass} />
      </Field>
      <Field label="Fuso horário" error={state.errors?.timeZone}>
        <TimeZoneSelect name="timeZone" value={zone} onChange={setZone} options={timeZones} />
      </Field>
      <span className="-mt-3 text-xs text-ink-500">
        Aulas e prazos são mostrados neste fuso para todos. Mudar o fuso não muda o horário real das aulas já marcadas.
      </span>
      <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start`}>
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
