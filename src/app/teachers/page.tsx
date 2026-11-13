import type { Metadata } from "next";
import Link from "next/link";

import { TeacherStatusButton } from "@/components/teacher-status-button";
import { requireUser } from "@/lib/auth";
import { listTeachers } from "@/lib/teachers";

export const metadata: Metadata = { title: "Teachers" };

const PAGE_SIZE = 20;

export default async function TeachersPage({ searchParams }: PageProps<"/teachers">) {
  await requireUser(["ADMIN"]);
  const { page, created } = await searchParams;
  const pageNumber = Math.max(0, Number(page) || 0);
  const teachers = await listTeachers(pageNumber, PAGE_SIZE);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <Link href="/teachers/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          New teacher
        </Link>
      </div>

      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Teacher created. Share the initial password with them; they will be asked to change it on first login.
        </p>
      )}

      {teachers.content.length === 0 ? (
        <p className="text-zinc-500">No teachers registered.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {teachers.content.map((teacher) => (
                <tr key={teacher.id} className={teacher.active ? "" : "text-zinc-400"}>
                  <td className="px-4 py-3">{teacher.name}</td>
                  <td className="px-4 py-3">{teacher.email}</td>
                  <td className="px-4 py-3">{teacher.active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      <Link href={`/teachers/${teacher.id}/edit`} className="text-sm font-medium text-indigo-600 hover:underline">
                        Edit
                      </Link>
                      <TeacherStatusButton id={teacher.id} name={teacher.name} active={teacher.active} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {teachers.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Page {teachers.number + 1} of {teachers.totalPages} · {teachers.totalElements} teachers
          </span>
          <div className="flex gap-2">
            {teachers.number > 0 && <Link href={`/teachers?page=${teachers.number - 1}`} className="hover:underline">← Previous</Link>}
            {teachers.number + 1 < teachers.totalPages && <Link href={`/teachers?page=${teachers.number + 1}`} className="hover:underline">Next →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}
