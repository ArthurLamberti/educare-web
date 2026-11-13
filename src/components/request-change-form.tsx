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
          <Field label="New date">
            <input name="date" type="date" required defaultValue={state.values?.date} key={`d-${k}`} className={inputClass} />
          </Field>
          <Field label="New start time">
            <input name="time" type="time" required step={300} defaultValue={state.values?.time} key={`t-${k}`} className={inputClass} />
          </Field>
        </div>
        {state.errors?.proposedStartsAt && <span className="text-xs text-red-600">{state.errors.proposedStartsAt}</span>}
        <span className="text-xs text-zinc-500">School time ({timeZone.replaceAll("_", " ")}). The lesson keeps its duration.</span>
      </div>

      <Field label="Reason (optional)" error={state.errors?.reason}>
        <textarea name="reason" rows={3} maxLength={500} defaultValue={state.values?.reason} key={`r-${k}`} className={inputClass} />
      </Field>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Sending..." : "Send request"}
        </button>
        <Link href="/lessons" className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Back
        </Link>
      </div>
    </form>
  );
}
