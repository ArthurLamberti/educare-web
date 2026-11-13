import type { Metadata } from "next";
import Link from "next/link";

import { listAssignments } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";

export const metadata: Metadata = { title: "To grade" };

const PAGE_SIZE = 20;

/** Submitted work of the teacher's tasks, oldest submission first. */
export default async function GradingPage({ searchParams }: PageProps<"/grading">) {
  const user = await requireUser(["TEACHER"]);
  const zone = user.tenant.timeZone;
  const { page, graded } = await searchParams;
  const pageNumber = Math.max(0, Number(page) || 0);
  const queue = await listAssignments({ statuses: ["SUBMITTED"], page: pageNumber, size: PAGE_SIZE });

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">To grade ({queue.totalElements})</h1>
      {graded && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Grade saved. The student can see it now.
        </p>
      )}
      <p className="text-xs text-zinc-500">Oldest submission first. Times in the school&apos;s time zone ({zone.replaceAll("_", " ")}).</p>

      {queue.content.length === 0 ? (
        <p className="text-zinc-500">
          Nothing to grade. Graded work is in <Link href="/assignments?status=GRADED" className="text-indigo-600 hover:underline">Assignments</Link>.
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="py-2 font-medium">Submitted</th>
              <th className="py-2 font-medium">Student</th>
              <th className="py-2 font-medium">Task</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {queue.content.map((a) => (
              <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">
                  {a.submission && formatDateTime(a.submission.submittedAt, zone)}
                  {a.submission?.late && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">Late</span>
                  )}
                </td>
                <td className="py-2">{a.studentName}</td>
                <td className="py-2">{a.taskTitle}</td>
                <td className="py-2 text-right">
                  <Link href={`/grading/${a.id}`} className="font-medium text-indigo-600 hover:underline">
                    Grade
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {queue.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Page {queue.number + 1} of {queue.totalPages}</span>
          <div className="flex gap-2">
            {queue.number > 0 && <Link href={`/grading?page=${queue.number - 1}`} className="hover:underline">← Previous</Link>}
            {queue.number + 1 < queue.totalPages && <Link href={`/grading?page=${queue.number + 1}`} className="hover:underline">Next →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}
