import { formatScore, type Assignment } from "@/lib/assignments";

const STATUS = {
  ASSIGNED: { label: "Assigned", className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300" },
  SUBMITTED: { label: "Submitted", className: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300" },
  GRADED: { label: "Graded", className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
} as const;

/** Status badge, the score once graded, and "Overdue" / "Submitted late" flags. */
export function AssignmentStatusBadge({ assignment }: { assignment: Pick<Assignment, "status" | "overdue" | "submission" | "grade"> }) {
  const status = STATUS[assignment.status];
  return (
    <span className="inline-flex flex-wrap gap-1">
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
        {status.label}
        {assignment.grade && ` · ${formatScore(assignment.grade.score)}`}
      </span>
      {assignment.overdue && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">Overdue</span>
      )}
      {assignment.submission?.late && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">Submitted late</span>
      )}
    </span>
  );
}
