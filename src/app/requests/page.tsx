import type { Metadata } from "next";
import Link from "next/link";

import { RequestDecision, WithdrawButton } from "@/components/request-actions";
import { requireUser, type Role } from "@/lib/auth";
import { formatDateTime, formatTime } from "@/lib/datetime";
import { listRequests, type RequestStatus, type RescheduleRequest } from "@/lib/reschedule-requests";

export const metadata: Metadata = { title: "Change requests" };

const PAGE_SIZE = 20;

const STATUS: Record<RequestStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
  WITHDRAWN: { label: "Withdrawn", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  CANCELED: { label: "Canceled", className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
};

/**
 * Students: their requests (newest first) with withdraw. Teachers: pending requests on their lessons
 * with approve/reject, then the decided ones. Admins: all requests, read-only.
 */
export default async function RequestsPage({ searchParams }: PageProps<"/requests">) {
  const user = await requireUser();
  const zone = user.tenant.timeZone;
  const { page, created } = await searchParams;
  const pageNumber = Math.max(0, Number(page) || 0);
  const isTeacher = user.role === "TEACHER";

  const [pending, all] = await Promise.all([
    isTeacher ? listRequests({ status: "PENDING", size: 100 }) : null,
    listRequests({ page: pageNumber, size: PAGE_SIZE }),
  ]);
  const history = isTeacher ? all.content.filter((r) => r.status !== "PENDING") : all.content;

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Change requests</h1>

      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Request sent. Your teacher will approve or reject it.
        </p>
      )}
      <p className="text-xs text-zinc-500">Times in the school&apos;s time zone ({zone.replaceAll("_", " ")}).</p>

      {pending && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Pending ({pending.totalElements})</h2>
          {pending.content.length === 0 ? (
            <p className="text-sm text-zinc-500">No requests waiting for you.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {pending.content.map((r) => (
                <RequestItem key={r.id} request={r} role={user.role} zone={zone} />
              ))}
            </ul>
          )}
          <h2 className="mt-4 text-lg font-semibold">Decided</h2>
        </div>
      )}

      {history.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {user.role === "STUDENT" ? (
            <>
              No requests yet. To ask for a new time, open your <Link href="/lessons" className="text-indigo-600 hover:underline">upcoming lessons</Link>.
            </>
          ) : (
            "No requests."
          )}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {history.map((r) => (
            <RequestItem key={r.id} request={r} role={user.role} zone={zone} />
          ))}
        </ul>
      )}

      {all.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Page {all.number + 1} of {all.totalPages}
          </span>
          <div className="flex gap-2">
            {all.number > 0 && <Link href={`/requests?page=${all.number - 1}`} className="hover:underline">← Previous</Link>}
            {all.number + 1 < all.totalPages && <Link href={`/requests?page=${all.number + 1}`} className="hover:underline">Next →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}

function RequestItem({ request: r, role, zone }: { request: RescheduleRequest; role: Role; zone: string }) {
  const status = STATUS[r.status];
  const minutes = r.durationMinutes * 60 * 1000;
  const range = (start: string) => `${formatDateTime(start, zone)}–${formatTime(new Date(new Date(start).getTime() + minutes).toISOString(), zone)}`;
  const who = role === "TEACHER" ? r.studentName : role === "STUDENT" ? `with ${r.teacherName}` : `${r.teacherName} → ${r.studentName}`;

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
        <span className="font-medium">{r.lessonTopic}</span>
        <span className="text-zinc-600 dark:text-zinc-400">{who}</span>
        <span className="ml-auto text-xs text-zinc-500">requested {formatDateTime(r.createdAt, zone)}</span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-zinc-500">{r.status === "APPROVED" ? "Was" : r.status === "PENDING" ? "Current time" : "Original time"}</dt>
        <dd>{range(r.originalStartsAt)}</dd>
        <dt className="text-zinc-500">{r.status === "APPROVED" ? "Moved to" : "Proposed"}</dt>
        <dd className="font-medium">{range(r.proposedStartsAt)}</dd>
        {r.reason && (
          <>
            <dt className="text-zinc-500">Reason</dt>
            <dd>{r.reason}</dd>
          </>
        )}
        {r.decisionNote && (
          <>
            <dt className="text-zinc-500">Teacher&apos;s note</dt>
            <dd>{r.decisionNote}</dd>
          </>
        )}
      </dl>
      {r.status === "PENDING" && role === "TEACHER" && <RequestDecision id={r.id} />}
      {r.status === "PENDING" && role === "STUDENT" && (
        <div className="flex justify-end">
          <WithdrawButton id={r.id} />
        </div>
      )}
    </li>
  );
}
