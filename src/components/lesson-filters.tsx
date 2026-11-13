"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Option = { id: number; name: string };

const selectClass = "rounded-md border border-ink-300 bg-white px-2 py-1 dark:border-ink-700 dark:bg-ink-900";

/** Admin filters kept in the URL (`?teacherId=&studentId=`), next to the current tab. */
export function LessonFilters({ teachers, students }: { teachers: Option[]; students: Option[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(name: string, value: string) {
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
      <label className="flex items-center gap-2">
        Professor
        <select value={searchParams.get("teacherId") ?? ""} onChange={(e) => update("teacherId", e.target.value)} className={selectClass}>
          <option value="">Todos os professores</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        Aluno
        <select value={searchParams.get("studentId") ?? ""} onChange={(e) => update("studentId", e.target.value)} className={selectClass}>
          <option value="">Todos os alunos</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
