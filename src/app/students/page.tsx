import type { Metadata } from "next";
import Link from "next/link";

import { DeleteStudentButton } from "@/components/delete-student-button";
import { listStudents } from "@/lib/students";

export const metadata: Metadata = { title: "Students" };

const PAGE_SIZE = 20;

export default async function StudentsPage({ searchParams }: PageProps<"/students">) {
  const { page } = await searchParams;
  const pageNumber = Math.max(0, Number(page) || 0);
  const students = await listStudents(pageNumber, PAGE_SIZE);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <Link href="/students/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          New student
        </Link>
      </div>

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
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {students.content.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-3">{student.name}</td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">{formatDate(student.birthDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      <Link href={`/students/${student.id}/edit`} className="text-sm font-medium text-indigo-600 hover:underline">
                        Edit
                      </Link>
                      <DeleteStudentButton id={student.id} name={student.name} />
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
            {students.number > 0 && <Link href={`/students?page=${students.number - 1}`} className="hover:underline">← Previous</Link>}
            {students.number + 1 < students.totalPages && <Link href={`/students?page=${students.number + 1}`} className="hover:underline">Next →</Link>}
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
