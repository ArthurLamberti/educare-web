import type { Assignment } from "@/lib/assignments";

const STATUS = {
  ASSIGNED: { label: "Assigned", className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300" },
  SUBMITTED: { label: "Submitted", className: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300" },
  GRADED: { label: "Graded", className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
} as const;

/** Status badge, plus "Overdue" when the due date passed without a submission. */
export function AssignmentStatusBadge({ assignment }: { assignment: Pick<Assignment, "status" | "overdue"> }) {
  const status = STATUS[assignment.status];
  return (
    <span className="flex gap-1">
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
      {assignment.overdue && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">Overdue</span>
      )}
    </span>
  );
}
