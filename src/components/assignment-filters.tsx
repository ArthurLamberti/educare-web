"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const selectClass = "rounded-md border border-ink-300 bg-white px-2 py-1 dark:border-ink-700 dark:bg-ink-900";

/**
 * Student, status, level and (for teachers, who own them) category filters kept in the URL
 * (`?studentId=&status=&levelId=&categoryId=`).
 */
export function AssignmentFilters({
  students,
  levels,
  categories,
}: {
  students: { id: number; name: string }[];
  levels: { id: number; code: string; name: string }[];
  categories?: { id: number; name: string }[];
}) {
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
      <label className="flex items-center gap-2">
        Situação
        <select value={searchParams.get("status") ?? ""} onChange={(e) => update("status", e.target.value)} className={selectClass}>
          <option value="">Todas</option>
          <option value="ASSIGNED">Atribuída</option>
          <option value="SUBMITTED">Entregue</option>
          <option value="GRADED">Corrigida</option>
        </select>
      </label>
      <label className="flex items-center gap-2">
        Nível
        <select value={searchParams.get("levelId") ?? ""} onChange={(e) => update("levelId", e.target.value)} className={selectClass}>
          <option value="">Todos</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} · {l.name}
            </option>
          ))}
        </select>
      </label>
      {categories && (
        <label className="flex items-center gap-2">
          Categoria
          <select value={searchParams.get("categoryId") ?? ""} onChange={(e) => update("categoryId", e.target.value)} className={selectClass}>
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
