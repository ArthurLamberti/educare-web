"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TeacherOption = { id: number; name: string };

/** Filters kept in the URL (`?teacherId=&inactive=1`), so they survive reloads and links. */
export function StudentFilters({ teachers }: { teachers?: TeacherOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(name: string, value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    params.delete("created");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      {teachers && (
        <label className="flex items-center gap-2">
          Teacher
          <select
            value={searchParams.get("teacherId") ?? ""}
            onChange={(e) => update("teacherId", e.target.value || null)}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">All teachers</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={searchParams.get("inactive") === "1"}
          onChange={(e) => update("inactive", e.target.checked ? "1" : null)}
        />
        Show inactive
      </label>
    </div>
  );
}
