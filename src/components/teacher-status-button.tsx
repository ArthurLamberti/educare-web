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
        if (active && !window.confirm(`Deactivate teacher "${name}"? They will no longer be able to log in.`)) return;
        startTransition(() => changeTeacherStatus(id, !active));
      }}
      className={`text-sm font-medium hover:underline disabled:opacity-50 ${active ? "text-red-600" : "text-indigo-600"}`}
    >
      {pending ? "Saving..." : active ? "Deactivate" : "Reactivate"}
    </button>
  );
}
