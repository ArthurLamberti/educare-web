import type { Metadata } from "next";
import Link from "next/link";

import { StudentFilters } from "@/components/student-filters";
import { StudentStatusButton } from "@/components/student-status-button";
import { requireUser } from "@/lib/auth";
import { listStudents } from "@/lib/students";
import { listTeachers } from "@/lib/teachers";

export const metadata: Metadata = { title: "Alunos" };

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
        <h1 className="text-2xl font-bold">Alunos</h1>
        <Link href="/students/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500">
          Novo aluno
        </Link>
      </div>

      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Aluno cadastrado. Passe a senha inicial para ele.
        </p>
      )}

      <StudentFilters teachers={teachers?.content.map((t) => ({ id: t.id, name: t.name }))} />

      {students.content.length === 0 ? (
        <p className="text-ink-500">Nenhum aluno cadastrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-ink-600 dark:bg-ink-900 dark:text-ink-400">
              <tr>
                <th className="px-4 py-3 font-bold">Nome</th>
                <th className="px-4 py-3 font-bold">E-mail</th>
                <th className="px-4 py-3 font-bold">Data de nascimento</th>
                {isAdmin && <th className="px-4 py-3 font-bold">Professor</th>}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
              {students.content.map((student) => (
                <tr key={student.id} className={student.active ? "" : "text-ink-400"}>
                  <td className="px-4 py-3">
                    {student.name}
                    {!student.active && <span className="ml-2 text-xs">(inativo)</span>}
                  </td>
                  <td className="px-4 py-3">{student.email}</td>
                  <td className="px-4 py-3">{formatDate(student.birthDate)}</td>
                  {isAdmin && <td className="px-4 py-3">{student.teacherName}</td>}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      <Link href={`/students/${student.id}/flashcards`} className="text-sm font-bold text-brand-600 hover:underline">
                        Flashcards
                      </Link>
                      {student.active && (
                        <Link href={`/students/${student.id}/edit`} className="text-sm font-bold text-brand-600 hover:underline">
                          Editar
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
          <span className="text-ink-500">
            Página {students.number + 1} de {students.totalPages} · {students.totalElements} alunos
          </span>
          <div className="flex gap-2">
            {students.number > 0 && <Link href={pageLink(students.number - 1)} className="hover:underline">← Anterior</Link>}
            {students.number + 1 < students.totalPages && <Link href={pageLink(students.number + 1)} className="hover:underline">Próxima →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
