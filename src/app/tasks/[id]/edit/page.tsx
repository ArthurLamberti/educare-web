import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaskForm } from "@/components/task-form";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getTask } from "@/lib/tasks";

export const metadata: Metadata = { title: "Edit task" };

export default async function EditTaskPage({ params }: PageProps<"/tasks/[id]/edit">) {
  await requireUser(["TEACHER"]);
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const task = await getTask(id).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Edit task</h1>
      {task.assignmentCount > 0 && (
        <p className="max-w-2xl rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          This task is assigned. Students who have not submitted yet will see your changes.
        </p>
      )}
      <TaskForm task={{ id: task.id, title: task.title, instructions: task.instructions }} />
    </section>
  );
}
