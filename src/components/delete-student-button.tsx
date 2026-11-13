"use client";

import { useTransition } from "react";

import { removeStudent } from "@/app/students/actions";

export function DeleteStudentButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete student "${name}"?`)) return;
        startTransition(() => removeStudent(id));
      }}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
