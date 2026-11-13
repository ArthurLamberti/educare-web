"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const selectClass = "rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900";

/** Student and status filters kept in the URL (`?studentId=&status=`). */
export function AssignmentFilters({ students }: { students: { id: number; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(name: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <label className="flex items-center gap-2">
        Student
        <select value={searchParams.get("studentId") ?? ""} onChange={(e) => update("studentId", e.target.value)} className={selectClass}>
          <option value="">All students</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        Status
        <select value={searchParams.get("status") ?? ""} onChange={(e) => update("status", e.target.value)} className={selectClass}>
          <option value="">All</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="GRADED">Graded</option>
        </select>
      </label>
    </div>
  );
}
