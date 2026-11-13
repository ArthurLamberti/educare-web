"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveTeacher, type TeacherFormState } from "@/app/teachers/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

type TeacherValues = { id: number; name: string; email: string };

export function TeacherForm({ teacher }: { teacher?: TeacherValues }) {
  const action = saveTeacher.bind(null, teacher?.id ?? null);
  const [state, formAction, pending] = useActionState<TeacherFormState, FormData>(action, {});
  const values = {
    name: state.values?.name ?? teacher?.name ?? "",
    email: state.values?.email ?? teacher?.email ?? "",
  };

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <FormMessage message={state.message} />
      <Field label="Name" error={state.errors?.name}>
        <input name="name" required maxLength={150} defaultValue={values.name} key={`name-${values.name}`} className={inputClass} />
      </Field>
      <Field label="Email" error={state.errors?.email}>
        <input name="email" type="email" required maxLength={255} defaultValue={values.email} key={`email-${values.email}`} className={inputClass} />
      </Field>
      {!teacher && (
        <Field label="Initial password" error={state.errors?.initialPassword}>
          <input name="initialPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} />
          <span className="text-xs font-normal text-zinc-500">The teacher will be asked to change it on first login.</span>
        </Field>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : "Save"}
        </button>
        <Link href="/teachers" className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </Link>
      </div>
    </form>
  );
}
