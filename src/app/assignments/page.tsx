import type { Metadata } from "next";
import Link from "next/link";

import { AssignmentFilters } from "@/components/assignment-filters";
import { AssignmentStatusBadge } from "@/components/assignment-status";
import { listAssignments, type Assignment, type AssignmentStatus } from "@/lib/assignments";
import { requireUser, type User } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { listStudents } from "@/lib/students";

export const metadata: Metadata = { title: "Atividades" };

const PAGE_SIZE = 20;
const STATUSES: AssignmentStatus[] = ["ASSIGNED", "SUBMITTED", "GRADED"];

/** Students: their to-do list, then completed work. Teachers: assignments of their tasks; admins: all. */
export default async function AssignmentsPage({ searchParams }: PageProps<"/assignments">) {
  const user = await requireUser();
  const params = await searchParams;
  return user.role === "STUDENT" ? <StudentAssignments user={user} /> : <AssignmentOverview user={user} params={params} />;
}

async function StudentAssignments({ user }: { user: User }) {
  const zone = user.tenant.timeZone;
  const [pending, done] = await Promise.all([
    listAssignments({ statuses: ["ASSIGNED"], size: 100 }),
    listAssignments({ statuses: ["SUBMITTED", "GRADED"], size: 100 }),
  ]);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Minhas atividades</h1>
      <p className="text-xs text-ink-500">Horários no fuso da escola ({zone.replaceAll("_", " ")}).</p>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">A fazer ({pending.totalElements})</h2>
        {pending.content.length === 0 ? (
          <p className="text-sm text-ink-500">Nada para fazer agora.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.content.map((a) => (
              <StudentItem key={a.id} assignment={a} zone={zone} />
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Concluídas</h2>
        {done.content.length === 0 ? (
          <p className="text-sm text-ink-500">Nenhuma atividade entregue ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {done.content.map((a) => (
              <StudentItem key={a.id} assignment={a} zone={zone} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StudentItem({ assignment: a, zone }: { assignment: Assignment; zone: string }) {
  return (
    <li>
      <Link
        href={`/assignments/${a.id}`}
        className={`flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm hover:bg-ink-50 dark:hover:bg-ink-900 ${
          a.overdue ? "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30" : "border-ink-200 dark:border-ink-800"
        }`}
      >
        <span className="font-bold">{a.taskTitle}</span>
        <span className="text-ink-600 dark:text-ink-400">{a.teacherName}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className={a.overdue ? "font-bold text-red-700 dark:text-red-400" : "text-ink-600 dark:text-ink-400"}>
            {a.dueAt ? `Prazo: ${formatDateTime(a.dueAt, zone)}` : "Sem prazo"}
          </span>
          <AssignmentStatusBadge assignment={a} />
        </span>
      </Link>
    </li>
  );
}

async function AssignmentOverview({ user, params }: { user: User; params: Record<string, string | string[] | undefined> }) {
  const zone = user.tenant.timeZone;
  const isAdmin = user.role === "ADMIN";
  const studentId = Number(params.studentId) > 0 ? Number(params.studentId) : undefined;
  const status = STATUSES.find((s) => s === params.status);
  const pageNumber = Math.max(0, Number(params.page) || 0);

  const [assignments, students] = await Promise.all([
    listAssignments({ studentId, statuses: status ? [status] : [], page: pageNumber, size: PAGE_SIZE }),
    listStudents(0, 200, { includeInactive: true }),
  ]);

  const link = (p: number) => {
    const q = new URLSearchParams({ ...(studentId && { studentId: String(studentId) }), ...(status && { status }), page: String(p) });
    return `/assignments?${q}`;
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Atividades</h1>
        {!isAdmin && (
          <Link href="/tasks" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500">
            Atribuir tarefa
          </Link>
        )}
      </div>

      <AssignmentFilters students={students.content.map((s) => ({ id: s.id, name: s.name }))} />
      <p className="text-xs text-ink-500">Horários no fuso da escola ({zone.replaceAll("_", " ")}).</p>

      {assignments.content.length === 0 ? (
        <p className="text-ink-500">{studentId || status ? "Nenhuma atividade com esses filtros." : "Nenhuma atividade ainda."}</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-200 text-ink-500 dark:border-ink-800">
            <tr>
              <th className="py-2 font-bold">Tarefa</th>
              {isAdmin && <th className="py-2 font-bold">Professor</th>}
              <th className="py-2 font-bold">Aluno</th>
              <th className="py-2 font-bold">Prazo</th>
              <th className="py-2 font-bold">Situação</th>
            </tr>
          </thead>
          <tbody>
            {assignments.content.map((a) => (
              <tr key={a.id} className="border-b border-ink-100 dark:border-ink-900">
                <td className="py-2">
                  <Link href={`/assignments/${a.id}`} className="font-bold hover:text-brand-600 hover:underline">
                    {a.taskTitle}
                  </Link>
                </td>
                {isAdmin && <td className="py-2">{a.teacherName}</td>}
                <td className="py-2">{a.studentName}</td>
                <td className="py-2">{a.dueAt ? formatDateTime(a.dueAt, zone) : <span className="text-ink-500">Sem prazo</span>}</td>
                <td className="py-2"><AssignmentStatusBadge assignment={a} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {assignments.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">
            Página {assignments.number + 1} de {assignments.totalPages} · {assignments.totalElements} atividades
          </span>
          <div className="flex gap-2">
            {assignments.number > 0 && <Link href={link(assignments.number - 1)} className="hover:underline">← Anterior</Link>}
            {assignments.number + 1 < assignments.totalPages && <Link href={link(assignments.number + 1)} className="hover:underline">Próxima →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}
