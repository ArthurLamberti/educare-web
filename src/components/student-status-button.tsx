"use client";

import { useTransition } from "react";

import { changeStudentStatus } from "@/app/students/actions";

export function StudentStatusButton({ id, name, active }: { id: number; name: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (active && !window.confirm(`Desativar "${name}"? O aluno perde o acesso, mas o histórico é mantido.`)) return;
        startTransition(() => changeStudentStatus(id, !active));
      }}
      className={`text-sm font-bold hover:underline disabled:opacity-50 ${active ? "text-red-600" : "text-brand-600"}`}
    >
      {pending ? "Salvando..." : active ? "Desativar" : "Reativar"}
    </button>
  );
}
