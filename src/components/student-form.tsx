"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveStudent, type StudentFormState } from "@/app/students/actions";
import type { Student } from "@/lib/students";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900";

export function StudentForm({ student }: { student?: Student }) {
  const action = saveStudent.bind(null, student?.id ?? null);
  const [state, formAction, pending] = useActionState<StudentFormState, FormData>(action, {});

  const values = {
    name: state.values?.name ?? student?.name ?? "",
    email: state.values?.email ?? student?.email ?? "",
    birthDate: state.values?.birthDate ?? student?.birthDate ?? "",
  };

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state.message && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.message}
        </p>
      )}

      <Field label="Name" error={state.errors?.name}>
        <input name="name" required maxLength={150} defaultValue={values.name} key={`name-${values.name}`} className={inputClass} />
      </Field>

      <Field label="Email" error={state.errors?.email}>
        <input name="email" type="email" required maxLength={255} defaultValue={values.email} key={`email-${values.email}`} className={inputClass} />
      </Field>

      <Field label="Birth date" error={state.errors?.birthDate}>
        <input
          name="birthDate"
          type="date"
          defaultValue={values.birthDate}
          key={`bd-${values.birthDate}`}
          className={inputClass}
        />
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <Link href="/students" className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      {children}
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}
