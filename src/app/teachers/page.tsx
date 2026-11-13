import type { Metadata } from "next";
import Link from "next/link";

import { TeacherStatusButton } from "@/components/teacher-status-button";
import { requireUser } from "@/lib/auth";
import { listTeachers } from "@/lib/teachers";

export const metadata: Metadata = { title: "Professores" };

const PAGE_SIZE = 20;

export default async function TeachersPage({ searchParams }: PageProps<"/teachers">) {
  await requireUser(["ADMIN"]);
  const { page, created } = await searchParams;
  const pageNumber = Math.max(0, Number(page) || 0);
  const teachers = await listTeachers(pageNumber, PAGE_SIZE);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Professores</h1>
        <Link href="/teachers/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500">
          Novo professor
        </Link>
      </div>

      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Professor cadastrado. Passe a senha inicial para ele; ela será trocada no primeiro acesso.
        </p>
      )}

      {teachers.content.length === 0 ? (
        <p className="text-ink-500">Nenhum professor cadastrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-ink-600 dark:bg-ink-900 dark:text-ink-400">
              <tr>
                <th className="px-4 py-3 font-bold">Nome</th>
                <th className="px-4 py-3 font-bold">E-mail</th>
                <th className="px-4 py-3 font-bold">Situação</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
              {teachers.content.map((teacher) => (
                <tr key={teacher.id} className={teacher.active ? "" : "text-ink-400"}>
                  <td className="px-4 py-3">{teacher.name}</td>
                  <td className="px-4 py-3">{teacher.email}</td>
                  <td className="px-4 py-3">{teacher.active ? "Ativo" : "Inativo"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      <Link href={`/teachers/${teacher.id}/edit`} className="text-sm font-bold text-brand-600 hover:underline">
                        Editar
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
          <span className="text-ink-500">
            Página {teachers.number + 1} de {teachers.totalPages} · {teachers.totalElements} professores
          </span>
          <div className="flex gap-2">
            {teachers.number > 0 && <Link href={`/teachers?page=${teachers.number - 1}`} className="hover:underline">← Anterior</Link>}
            {teachers.number + 1 < teachers.totalPages && <Link href={`/teachers?page=${teachers.number + 1}`} className="hover:underline">Próxima →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}
