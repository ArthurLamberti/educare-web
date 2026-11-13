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

      <Field label="Name" error={state.errors?.name}>
        <input name="name" required maxLength={150} defaultValue={values.name} key={`name-${values.name}`} className={inputClass} />
      </Field>

      <Field label="Email" error={state.errors?.email}>
        <input name="email" type="email" required maxLength={255} defaultValue={values.email} key={`email-${values.email}`} className={inputClass} />
      </Field>

      <Field label="Birth date" error={state.errors?.birthDate}>
        <input name="birthDate" type="date" defaultValue={values.birthDate} key={`bd-${values.birthDate}`} className={inputClass} />
      </Field>

      {teachers && (
        <Field label="Teacher" error={state.errors?.teacherId}>
          <select name="teacherId" required defaultValue={values.teacherId} key={`t-${values.teacherId}`} className={inputClass}>
            <option value="" disabled>
              Choose a teacher
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
        <Field label="Initial password" error={state.errors?.initialPassword}>
          <input name="initialPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} />
          <span className="text-xs font-normal text-zinc-500">The student will be asked to change it on first login.</span>
        </Field>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving..." : "Save"}
        </button>
        <Link href="/students" className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </Link>
      </div>
    </form>
  );
}
