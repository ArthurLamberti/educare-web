"use client";

import { useTransition } from "react";

import { excluirAluno } from "@/app/alunos/actions";

export function DeleteAlunoButton({ id, nome }: { id: number; nome: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Excluir o aluno "${nome}"?`)) return;
        startTransition(() => excluirAluno(id));
      }}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Excluindo..." : "Excluir"}
    </button>
  );
}
