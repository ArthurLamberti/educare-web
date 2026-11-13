"use client";

import { useTransition } from "react";

import { changeTeacherStatus } from "@/app/teachers/actions";

export function TeacherStatusButton({ id, name, active }: { id: number; name: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (active && !window.confirm(`Desativar o professor "${name}"? Ele não vai mais conseguir entrar.`)) return;
        startTransition(() => changeTeacherStatus(id, !active));
      }}
      className={`text-sm font-bold hover:underline disabled:opacity-50 ${active ? "text-red-600" : "text-brand-600"}`}
    >
      {pending ? "Salvando..." : active ? "Desativar" : "Reativar"}
    </button>
  );
}
