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
        if (!window.confirm(`Cancel the lesson "${label}"? The time becomes free again.`)) return;
        startTransition(() => cancelLessonAction(id));
      }}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Canceling..." : "Cancel lesson"}
    </button>
  );
}
