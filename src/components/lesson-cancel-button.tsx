"use client";

import { useTransition } from "react";

import { cancelLessonAction } from "@/app/lessons/actions";

export function LessonCancelButton({ id, label }: { id: number; label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Cancelar a aula "${label}"? O horário fica livre de novo.`)) return;
        startTransition(() => cancelLessonAction(id));
      }}
      className="text-sm font-bold text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Cancelando..." : "Cancelar aula"}
    </button>
  );
}
