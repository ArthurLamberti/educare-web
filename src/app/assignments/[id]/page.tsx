import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnswerForm } from "@/components/answer-form";
import { AssignmentStatusBadge } from "@/components/assignment-status";
import { Markdown } from "@/components/markdown";
import { ApiError } from "@/lib/api";
import { formatScore, getAssignment } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";

export const metadata: Metadata = { title: "Assignment" };

const box = "rounded-lg border border-zinc-200 p-4 dark:border-zinc-800";

/**
 * Students answer here (until graded) and read their grade. Teachers and admins read the answer;
 * teachers go to the grading page from here.
 */
export default async function AssignmentPage({ params }: PageProps<"/assignments/[id]">) {
  const user = await requireUser();
  const zone = user.tenant.timeZone;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const a = await getAssignment(id).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  const isStudent = user.role === "STUDENT";
  const { submission, grade } = a;

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
        <dd className={a.overdue ? "font-medium text-red-700 dark:text-red-400" : ""}>{a.dueAt ? formatDateTime(a.dueAt, zone) : "No due date"}</dd>
        <dt className="text-zinc-500">Assigned</dt>
        <dd>{formatDateTime(a.assignedAt, zone)}</dd>
        {submission && (
          <>
            <dt className="text-zinc-500">Submitted</dt>
            <dd>
              {formatDateTime(submission.submittedAt, zone)}
              {submission.updatedAt !== submission.submittedAt && (
                <span className="text-zinc-500"> · last change {formatDateTime(submission.updatedAt, zone)}</span>
              )}
            </dd>
          </>
        )}
        {!isStudent && (
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
      </dl>

      {user.role === "TEACHER" && (
        <div className="flex gap-3 text-sm">
          {submission && (
            <Link href={`/grading/${a.id}`} className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500">
              {grade ? "Revise grade" : "Grade"}
            </Link>
          )}
          <Link href={`/tasks/${a.taskId}`} className="rounded-md px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950">
            Open task
          </Link>
        </div>
      )}

      {grade && (
        <div className="flex flex-col gap-2 rounded-lg border border-green-300 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <h2 className="flex items-baseline gap-3 text-lg font-semibold">
            Grade <span className="text-2xl">{formatScore(grade.score)}</span>
          </h2>
          <Markdown>{grade.feedback}</Markdown>
          <span className="text-xs text-zinc-500">
            {grade.gradedByName && `${grade.gradedByName}, `}
            {formatDateTime(grade.gradedAt, zone)}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Instructions</h2>
        {/* Once submitted, show the instructions as they were when answered. */}
        <div className={box}>
          <Markdown>{submission?.instructionsSnapshot ?? a.instructions}</Markdown>
        </div>
      </div>

      {isStudent && a.status !== "GRADED" ? (
        <AnswerForm id={a.id} answer={submission?.answer ?? ""} submitted={submission !== null} />
      ) : (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{isStudent ? "Your answer" : "Answer"}</h2>
          <div className={box}>{submission ? <Markdown>{submission.answer}</Markdown> : <p className="text-sm text-zinc-500">Not submitted yet.</p>}</div>
        </div>
      )}
    </section>
  );
}
