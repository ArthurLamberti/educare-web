import type { Metadata } from "next";
import Link from "next/link";

import { StudentFilters } from "@/components/student-filters";
import { StudentStatusButton } from "@/components/student-status-button";
import { requireUser } from "@/lib/auth";
import { listStudents } from "@/lib/students";
import { listTeachers } from "@/lib/teachers";

export const metadata: Metadata = { title: "Students" };

const PAGE_SIZE = 20;

export default async function StudentsPage({ searchParams }: PageProps<"/students">) {
  const user = await requireUser(["ADMIN", "TEACHER"]);
  const isAdmin = user.role === "ADMIN";
  const { page, created, teacherId, inactive } = await searchParams;
  const pageNumber = Math.max(0, Number(page) || 0);
  const filters = {
    teacherId: isAdmin && Number(teacherId) > 0 ? Number(teacherId) : undefined,
    includeInactive: inactive === "1",
  };
  const [students, teachers] = await Promise.all([
    listStudents(pageNumber, PAGE_SIZE, filters),
    isAdmin ? listTeachers(0, 200) : null,
  ]);

  const pageLink = (n: number) => {
    const params = new URLSearchParams({ page: String(n) });
    if (filters.teacherId) params.set("teacherId", String(filters.teacherId));
    if (filters.includeInactive) params.set("inactive", "1");
    return `/students?${params}`;
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <Link href="/students/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          New student
        </Link>
      </div>

      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Student created. Share the initial password with them.
        </p>
      )}

      <StudentFilters teachers={teachers?.content.map((t) => ({ id: t.id, name: t.name }))} />

      {students.content.length === 0 ? (
        <p className="text-zinc-500">No students registered.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Birth date</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Teacher</th>}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {students.content.map((student) => (
                <tr key={student.id} className={student.active ? "" : "text-zinc-400"}>
                  <td className="px-4 py-3">
                    {student.name}
                    {!student.active && <span className="ml-2 text-xs">(inactive)</span>}
                  </td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">{formatDate(student.birthDate)}</td>
                  {isAdmin && <td className="px-4 py-3">{student.teacherName}</td>}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      {student.active && (
                        <Link href={`/students/${student.id}/edit`} className="text-sm font-medium text-indigo-600 hover:underline">
                          Edit
                        </Link>
                      )}
                      <StudentStatusButton id={student.id} name={student.name} active={student.active} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {students.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Page {students.number + 1} of {students.totalPages} · {students.totalElements} students
          </span>
          <div className="flex gap-2">
            {students.number > 0 && <Link href={pageLink(students.number - 1)} className="hover:underline">← Previous</Link>}
            {students.number + 1 < students.totalPages && <Link href={pageLink(students.number + 1)} className="hover:underline">Next →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}
