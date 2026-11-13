"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveStudent, type StudentFormState } from "@/app/students/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

type StudentValues = { id: number; name: string; email: string; birthDate: string | null; teacherId: number };
type TeacherOption = { id: number; name: string };

/** `teachers` is passed only to admins, who choose (or change) the student's teacher. */
export function StudentForm({ student, teachers }: { student?: StudentValues; teachers?: TeacherOption[] }) {
  const action = saveStudent.bind(null, student?.id ?? null);
  const [state, formAction, pending] = useActionState<StudentFormState, FormData>(action, {});

  const values = {
    name: state.values?.name ?? student?.name ?? "",
    email: state.values?.email ?? student?.email ?? "",
    birthDate: state.values?.birthDate ?? student?.birthDate ?? "",
    teacherId: state.values?.teacherId ?? (student ? String(student.teacherId) : ""),
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

      <Field label="Data de nascimento" error={state.errors?.birthDate}>
        <input name="birthDate" type="date" defaultValue={values.birthDate} key={`bd-${values.birthDate}`} className={inputClass} />
      </Field>

      {teachers && (
        <Field label="Professor" error={state.errors?.teacherId}>
          <select name="teacherId" required defaultValue={values.teacherId} key={`t-${values.teacherId}`} className={inputClass}>
            <option value="" disabled>
              Escolha um professor
            </option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      {!student && (
        <Field label="Senha inicial" error={state.errors?.initialPassword}>
          <input name="initialPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} />
          <span className="text-xs font-normal text-ink-500">O aluno vai precisar trocá-la no primeiro acesso.</span>
        </Field>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/students" className="rounded-md px-4 py-2 text-sm font-bold text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
