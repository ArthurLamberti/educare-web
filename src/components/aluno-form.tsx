"use client";

import Link from "next/link";
import { useActionState } from "react";

import { salvarAluno, type AlunoFormState } from "@/app/alunos/actions";
import type { Aluno } from "@/lib/alunos";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900";

export function AlunoForm({ aluno }: { aluno?: Aluno }) {
  const action = salvarAluno.bind(null, aluno?.id ?? null);
  const [state, formAction, pending] = useActionState<AlunoFormState, FormData>(action, {});

  const values = {
    nome: state.values?.nome ?? aluno?.nome ?? "",
    email: state.values?.email ?? aluno?.email ?? "",
    dataNascimento: state.values?.dataNascimento ?? aluno?.dataNascimento ?? "",
  };

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state.message && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.message}
        </p>
      )}

      <Field label="Nome" error={state.errors?.nome}>
        <input name="nome" required maxLength={150} defaultValue={values.nome} key={`nome-${values.nome}`} className={inputClass} />
      </Field>

      <Field label="E-mail" error={state.errors?.email}>
        <input name="email" type="email" required maxLength={255} defaultValue={values.email} key={`email-${values.email}`} className={inputClass} />
      </Field>

      <Field label="Data de nascimento" error={state.errors?.dataNascimento}>
        <input
          name="dataNascimento"
          type="date"
          defaultValue={values.dataNascimento}
          key={`dn-${values.dataNascimento}`}
          className={inputClass}
        />
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <Link href="/alunos" className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancelar
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
