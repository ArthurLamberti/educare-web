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
      <Field label="Nome" error={state.errors?.name}>
        <input name="name" required maxLength={150} defaultValue={values.name} key={`name-${values.name}`} className={inputClass} />
      </Field>
      <Field label="E-mail" error={state.errors?.email}>
        <input name="email" type="email" required maxLength={255} defaultValue={values.email} key={`email-${values.email}`} className={inputClass} />
      </Field>
      {!teacher && (
        <Field label="Senha inicial" error={state.errors?.initialPassword}>
          <input name="initialPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} />
          <span className="text-xs font-normal text-ink-500">O professor vai precisar trocá-la no primeiro acesso.</span>
        </Field>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/teachers" className="rounded-md px-4 py-2 text-sm font-bold text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
