import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssignForm } from "@/components/assign-form";
import { AssignmentStatusBadge } from "@/components/assignment-status";
import { Markdown } from "@/components/markdown";
import { TaskActions, UnassignButton } from "@/components/task-actions";
import { ApiError } from "@/lib/api";
import { listAssignments } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { listStudents } from "@/lib/students";
import { getTask } from "@/lib/tasks";

export const metadata: Metadata = { title: "Task" };

/** Task detail: instructions, archive/delete, assigning, and who has it. */
export default async function TaskPage({ params, searchParams }: PageProps<"/tasks/[id]">) {
  const user = await requireUser(["TEACHER"]);
  const zone = user.tenant.timeZone;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { created } = await searchParams;

  const [task, assignments, students] = await Promise.all([
    getTask(id).catch((error) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    listAssignments({ taskId: id, size: 200 }),
    listStudents(0, 200),
  ]);

  return (
    <section className="flex flex-col gap-8">
      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Task created. Assign it to your students below.
        </p>
      )}

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/tasks" className="text-sm text-zinc-500 hover:underline">← Tasks</Link>
          <h1 className="text-2xl font-bold">
            {task.title}
            {task.archived && <span className="ml-3 rounded-full bg-zinc-100 px-2 py-0.5 align-middle text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Archived</span>}
          </h1>
          <span className="text-xs text-zinc-500">Last update {formatDateTime(task.updatedAt, zone)}</span>
        </div>
        <div className="ml-auto flex items-start gap-2">
          <Link href={`/tasks/${task.id}/edit`} className="rounded-md px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950">
            Edit
          </Link>
          <TaskActions id={task.id} archived={task.archived} deletable={task.assignmentCount === 0} />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <Markdown>{task.instructions}</Markdown>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Assign</h2>
        {task.archived ? (
          <p className="text-sm text-zinc-500">Archived tasks cannot be assigned. Unarchive it to assign it again.</p>
        ) : students.content.length === 0 ? (
          <p className="text-sm text-zinc-500">
            You have no active students. <Link href="/students/new" className="text-indigo-600 hover:underline">Register a student</Link> first.
          </p>
        ) : (
          <AssignForm taskId={task.id} students={students.content.map((s) => ({ id: s.id, name: s.name }))} timeZone={zone} />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Assigned to ({assignments.totalElements})</h2>
        {assignments.content.length === 0 ? (
          <p className="text-sm text-zinc-500">Not assigned yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="py-2 font-medium">Student</th>
                <th className="py-2 font-medium">Due</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {assignments.content.map((a) => (
                <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2">{a.studentName}</td>
                  <td className="py-2">{a.dueAt ? formatDateTime(a.dueAt, zone) : <span className="text-zinc-500">No due date</span>}</td>
                  <td className="py-2"><AssignmentStatusBadge assignment={a} /></td>
                  <td className="py-2 text-right">
                    {a.status === "ASSIGNED" ? (
                      <UnassignButton id={a.id} studentName={a.studentName} />
                    ) : (
                      <Link href={`/grading/${a.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                        {a.status === "GRADED" ? "Revise grade" : "Grade"}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
