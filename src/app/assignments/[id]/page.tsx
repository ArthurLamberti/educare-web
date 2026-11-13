import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssignmentStatusBadge } from "@/components/assignment-status";
import { Markdown } from "@/components/markdown";
import { ApiError } from "@/lib/api";
import { getAssignment } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";

export const metadata: Metadata = { title: "Assignment" };

/** Task title, due date and instructions. Change 07 adds the answer and the grade here. */
export default async function AssignmentPage({ params }: PageProps<"/assignments/[id]">) {
  const user = await requireUser();
  const zone = user.tenant.timeZone;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const a = await getAssignment(id).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/assignments" className="text-sm text-zinc-500 hover:underline">← Assignments</Link>
        <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold">
          {a.taskTitle}
          <AssignmentStatusBadge assignment={a} />
        </h1>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
        <dt className="text-zinc-500">Due</dt>
        <dd className={a.overdue ? "font-medium text-red-700 dark:text-red-400" : ""}>
          {a.dueAt ? formatDateTime(a.dueAt, zone) : "No due date"}
        </dd>
        <dt className="text-zinc-500">Assigned</dt>
        <dd>{formatDateTime(a.assignedAt, zone)}</dd>
        {user.role !== "STUDENT" && (
          <>
            <dt className="text-zinc-500">Student</dt>
            <dd>{a.studentName}</dd>
          </>
        )}
        {user.role !== "TEACHER" && (
          <>
            <dt className="text-zinc-500">Teacher</dt>
            <dd>{a.teacherName}</dd>
          </>
        )}
        {user.role === "TEACHER" && (
          <>
            <dt className="text-zinc-500">Task</dt>
            <dd>
              <Link href={`/tasks/${a.taskId}`} className="text-indigo-600 hover:underline">Open task</Link>
            </dd>
          </>
        )}
      </dl>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <Markdown>{a.instructions}</Markdown>
        </div>
      </div>
    </section>
  );
}
