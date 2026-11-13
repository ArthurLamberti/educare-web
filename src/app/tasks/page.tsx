import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";

import { inputClass } from "@/components/form-field";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { listTasks } from "@/lib/tasks";

export const metadata: Metadata = { title: "Tarefas" };

const PAGE_SIZE = 20;

/** The teacher's task library: newest first, title search, archived hidden unless asked. */
export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  const user = await requireUser(["TEACHER"]);
  const { q: rawQ, archived, page, deleted } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ.trim() : "";
  const includeArchived = archived === "1";
  const pageNumber = Math.max(0, Number(page) || 0);
  const tasks = await listTasks({ q, includeArchived, page: pageNumber, size: PAGE_SIZE });

  const link = (p: number) => {
    const params = new URLSearchParams({ ...(q && { q }), ...(includeArchived && { archived: "1" }), page: String(p) });
    return `/tasks?${params}`;
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <Link href="/tasks/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500">
          Nova tarefa
        </Link>
      </div>

      {deleted && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Tarefa excluída.
        </p>
      )}

      <Form action="/tasks" className="flex flex-wrap items-center gap-4 text-sm">
        <input name="q" type="search" defaultValue={q} placeholder="Buscar pelo título" aria-label="Buscar pelo título" className={`${inputClass} max-w-xs`} />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="archived" value="1" defaultChecked={includeArchived} />
          Mostrar arquivadas
        </label>
        <button type="submit" className="rounded-md border border-ink-300 px-3 py-2 font-bold hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800">
          Buscar
        </button>
      </Form>

      {tasks.content.length === 0 ? (
        <p className="text-ink-500">
          {q ? `Nenhuma tarefa encontrada para "${q}".` : (
            <>
              Nenhuma tarefa ainda. <Link href="/tasks/new" className="text-brand-600 hover:underline">Escreva sua primeira tarefa</Link>.
            </>
          )}
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-200 text-ink-500 dark:border-ink-800">
            <tr>
              <th className="py-2 font-bold">Título</th>
              <th className="py-2 font-bold">Última atualização</th>
              <th className="py-2 text-right font-bold">Atribuições</th>
            </tr>
          </thead>
          <tbody>
            {tasks.content.map((t) => (
              <tr key={t.id} className="border-b border-ink-100 dark:border-ink-900">
                <td className="py-2">
                  <Link href={`/tasks/${t.id}`} className="font-bold hover:text-brand-600 hover:underline">
                    {t.title}
                  </Link>
                  {t.archived && <span className="ml-2 rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-600 dark:bg-ink-800 dark:text-ink-300">Arquivada</span>}
                </td>
                <td className="py-2 text-ink-600 dark:text-ink-400">{formatDateTime(t.updatedAt, user.tenant.timeZone)}</td>
                <td className="py-2 text-right">{t.assignmentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tasks.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">
            Página {tasks.number + 1} de {tasks.totalPages} · {tasks.totalElements} tarefas
          </span>
          <div className="flex gap-2">
            {tasks.number > 0 && <Link href={link(tasks.number - 1)} className="hover:underline">← Anterior</Link>}
            {tasks.number + 1 < tasks.totalPages && <Link href={link(tasks.number + 1)} className="hover:underline">Próxima →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}
