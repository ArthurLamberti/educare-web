import type { Metadata } from "next";
import Link from "next/link";

import { AssignmentFilters } from "@/components/assignment-filters";
import { AssignmentStatusBadge } from "@/components/assignment-status";
import { listAssignments, type Assignment, type AssignmentStatus } from "@/lib/assignments";
import { requireUser, type User } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { listStudents } from "@/lib/students";

export const metadata: Metadata = { title: "Assignments" };

const PAGE_SIZE = 20;
const STATUSES: AssignmentStatus[] = ["ASSIGNED", "SUBMITTED", "GRADED"];

/** Students: their to-do list, then completed work. Teachers: assignments of their tasks; admins: all. */
export default async function AssignmentsPage({ searchParams }: PageProps<"/assignments">) {
  const user = await requireUser();
  const params = await searchParams;
  return user.role === "STUDENT" ? <StudentAssignments user={user} /> : <AssignmentOverview user={user} params={params} />;
}

async function StudentAssignments({ user }: { user: User }) {
  const zone = user.tenant.timeZone;
  const [pending, done] = await Promise.all([
    listAssignments({ statuses: ["ASSIGNED"], size: 100 }),
    listAssignments({ statuses: ["SUBMITTED", "GRADED"], size: 100 }),
  ]);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My assignments</h1>
      <p className="text-xs text-zinc-500">Times in the school&apos;s time zone ({zone.replaceAll("_", " ")}).</p>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">To do ({pending.totalElements})</h2>
        {pending.content.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing to do right now.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.content.map((a) => (
              <StudentItem key={a.id} assignment={a} zone={zone} />
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Completed</h2>
        {done.content.length === 0 ? (
          <p className="text-sm text-zinc-500">No submitted work yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {done.content.map((a) => (
              <StudentItem key={a.id} assignment={a} zone={zone} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StudentItem({ assignment: a, zone }: { assignment: Assignment; zone: string }) {
  return (
    <li>
      <Link
        href={`/assignments/${a.id}`}
        className={`flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
          a.overdue ? "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30" : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <span className="font-medium">{a.taskTitle}</span>
        <span className="text-zinc-600 dark:text-zinc-400">{a.teacherName}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className={a.overdue ? "font-medium text-red-700 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400"}>
            {a.dueAt ? `Due ${formatDateTime(a.dueAt, zone)}` : "No due date"}
          </span>
          <AssignmentStatusBadge assignment={a} />
        </span>
      </Link>
    </li>
  );
}

async function AssignmentOverview({ user, params }: { user: User; params: Record<string, string | string[] | undefined> }) {
  const zone = user.tenant.timeZone;
  const isAdmin = user.role === "ADMIN";
  const studentId = Number(params.studentId) > 0 ? Number(params.studentId) : undefined;
  const status = STATUSES.find((s) => s === params.status);
  const pageNumber = Math.max(0, Number(params.page) || 0);

  const [assignments, students] = await Promise.all([
    listAssignments({ studentId, statuses: status ? [status] : [], page: pageNumber, size: PAGE_SIZE }),
    listStudents(0, 200, { includeInactive: true }),
  ]);

  const link = (p: number) => {
    const q = new URLSearchParams({ ...(studentId && { studentId: String(studentId) }), ...(status && { status }), page: String(p) });
    return `/assignments?${q}`;
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
        {!isAdmin && (
          <Link href="/tasks" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            Assign a task
          </Link>
        )}
      </div>

      <AssignmentFilters students={students.content.map((s) => ({ id: s.id, name: s.name }))} />
      <p className="text-xs text-zinc-500">Times in the school&apos;s time zone ({zone.replaceAll("_", " ")}).</p>

      {assignments.content.length === 0 ? (
        <p className="text-zinc-500">No assignments{studentId || status ? " match these filters" : " yet"}.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="py-2 font-medium">Task</th>
              {isAdmin && <th className="py-2 font-medium">Teacher</th>}
              <th className="py-2 font-medium">Student</th>
              <th className="py-2 font-medium">Due</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.content.map((a) => (
              <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">
                  <Link href={`/assignments/${a.id}`} className="font-medium hover:text-indigo-600 hover:underline">
                    {a.taskTitle}
                  </Link>
                </td>
                {isAdmin && <td className="py-2">{a.teacherName}</td>}
                <td className="py-2">{a.studentName}</td>
                <td className="py-2">{a.dueAt ? formatDateTime(a.dueAt, zone) : <span className="text-zinc-500">No due date</span>}</td>
                <td className="py-2"><AssignmentStatusBadge assignment={a} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {assignments.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Page {assignments.number + 1} of {assignments.totalPages} · {assignments.totalElements} assignments
          </span>
          <div className="flex gap-2">
            {assignments.number > 0 && <Link href={link(assignments.number - 1)} className="hover:underline">← Previous</Link>}
            {assignments.number + 1 < assignments.totalPages && <Link href={link(assignments.number + 1)} className="hover:underline">Next →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}
