import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";

import { inputClass } from "@/components/form-field";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { listTasks } from "@/lib/tasks";

export const metadata: Metadata = { title: "Tasks" };

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
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link href="/tasks/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          New task
        </Link>
      </div>

      {deleted && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Task deleted.
        </p>
      )}

      <Form action="/tasks" className="flex flex-wrap items-center gap-4 text-sm">
        <input name="q" type="search" defaultValue={q} placeholder="Search by title" aria-label="Search by title" className={`${inputClass} max-w-xs`} />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="archived" value="1" defaultChecked={includeArchived} />
          Show archived
        </label>
        <button type="submit" className="rounded-md border border-zinc-300 px-3 py-2 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Search
        </button>
      </Form>

      {tasks.content.length === 0 ? (
        <p className="text-zinc-500">
          {q ? `No tasks match "${q}".` : (
            <>
              No tasks yet. <Link href="/tasks/new" className="text-indigo-600 hover:underline">Write your first task</Link>.
            </>
          )}
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <tr>
              <th className="py-2 font-medium">Title</th>
              <th className="py-2 font-medium">Last update</th>
              <th className="py-2 text-right font-medium">Assignments</th>
            </tr>
          </thead>
          <tbody>
            {tasks.content.map((t) => (
              <tr key={t.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">
                  <Link href={`/tasks/${t.id}`} className="font-medium hover:text-indigo-600 hover:underline">
                    {t.title}
                  </Link>
                  {t.archived && <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Archived</span>}
                </td>
                <td className="py-2 text-zinc-600 dark:text-zinc-400">{formatDateTime(t.updatedAt, user.tenant.timeZone)}</td>
                <td className="py-2 text-right">{t.assignmentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tasks.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Page {tasks.number + 1} of {tasks.totalPages} · {tasks.totalElements} tasks
          </span>
          <div className="flex gap-2">
            {tasks.number > 0 && <Link href={link(tasks.number - 1)} className="hover:underline">← Previous</Link>}
            {tasks.number + 1 < tasks.totalPages && <Link href={link(tasks.number + 1)} className="hover:underline">Next →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}
