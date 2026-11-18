import type { Metadata } from "next";

import { TaskForm } from "@/components/task-form";
import { requireUser } from "@/lib/auth";
import { getLevels } from "@/lib/levels";
import { listTaskCategories } from "@/lib/task-categories";

export const metadata: Metadata = { title: "Nova tarefa" };

export default async function NewTaskPage() {
  await requireUser(["TEACHER"]);
  const [levels, categories] = await Promise.all([getLevels(), listTaskCategories()]);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nova tarefa</h1>
      <TaskForm levels={levels} categories={categories} />
    </section>
  );
}
