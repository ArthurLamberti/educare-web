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
        if (active && !window.confirm(`Deactivate "${name}"? The student will lose access but their history is kept.`)) return;
        startTransition(() => changeStudentStatus(id, !active));
      }}
      className={`text-sm font-medium hover:underline disabled:opacity-50 ${active ? "text-red-600" : "text-indigo-600"}`}
    >
      {pending ? "Saving..." : active ? "Deactivate" : "Reactivate"}
    </button>
  );
}
