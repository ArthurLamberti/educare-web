import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssignmentStatusBadge } from "@/components/assignment-status";
import { GradeForm } from "@/components/grade-form";
import { Markdown } from "@/components/markdown";
import { ApiError } from "@/lib/api";
import { getAssignment } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";

export const metadata: Metadata = { title: "Grade" };

const box = "rounded-lg border border-zinc-200 p-4 dark:border-zinc-800";

/** The instructions the student saw, their answer, and the score + feedback form (also to revise). */
export default async function GradePage({ params }: PageProps<"/grading/[id]">) {
  const user = await requireUser(["TEACHER"]);
  const zone = user.tenant.timeZone;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const a = await getAssignment(id).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  const { submission, grade } = a;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/grading" className="text-sm text-zinc-500 hover:underline">← To grade</Link>
        <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold">
          {a.taskTitle} · {a.studentName}
          <AssignmentStatusBadge assignment={a} />
        </h1>
        {submission && (
          <span className="text-sm text-zinc-500">
            Submitted {formatDateTime(submission.submittedAt, zone)}
            {submission.updatedAt !== submission.submittedAt && ` · last change ${formatDateTime(submission.updatedAt, zone)}`}
            {a.dueAt && ` · due ${formatDateTime(a.dueAt, zone)}`}
          </span>
        )}
      </div>

      {!submission ? (
        <p className="text-zinc-500">The student has not submitted an answer yet.</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Instructions (as the student saw them)</h2>
            <div className={box}>
              <Markdown>{submission.instructionsSnapshot}</Markdown>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Answer</h2>
            <div className={box}>
              <Markdown>{submission.answer}</Markdown>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{grade ? "Revise grade" : "Grade"}</h2>
            <GradeForm id={a.id} version={submission.version} score={grade?.score} feedback={grade?.feedback} />
          </div>
        </>
      )}
    </section>
  );
}
