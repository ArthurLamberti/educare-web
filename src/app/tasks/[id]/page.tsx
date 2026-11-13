import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssignForm } from "@/components/assign-form";
import { AssignmentStatusBadge } from "@/components/assignment-status";
import { Markdown } from "@/components/markdown";
import { TaskActions, UnassignButton } from "@/components/task-actions";
import { ApiError } from "@/lib/api";
import { listAssignments } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { listStudents } from "@/lib/students";
import { getTask } from "@/lib/tasks";

export const metadata: Metadata = { title: "Tarefa" };

/** Task detail: instructions, archive/delete, assigning, and who has it. */
export default async function TaskPage({ params, searchParams }: PageProps<"/tasks/[id]">) {
  const user = await requireUser(["TEACHER"]);
  const zone = user.tenant.timeZone;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { created } = await searchParams;

  const [task, assignments, students] = await Promise.all([
    getTask(id).catch((error) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    listAssignments({ taskId: id, size: 200 }),
    listStudents(0, 200),
  ]);

  return (
    <section className="flex flex-col gap-8">
      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Tarefa criada. Atribua aos seus alunos abaixo.
        </p>
      )}

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/tasks" className="text-sm text-ink-500 hover:underline">← Tarefas</Link>
          <h1 className="text-2xl font-bold">
            {task.title}
            {task.archived && <span className="ml-3 rounded-full bg-ink-100 px-2 py-0.5 align-middle text-xs font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">Arquivada</span>}
          </h1>
          <span className="text-xs text-ink-500">Última atualização: {formatDateTime(task.updatedAt, zone)}</span>
        </div>
        <div className="ml-auto flex items-start gap-2">
          <Link href={`/tasks/${task.id}/edit`} className="rounded-md px-3 py-1.5 text-sm font-bold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950">
            Editar
          </Link>
          <TaskActions id={task.id} archived={task.archived} deletable={task.assignmentCount === 0} />
        </div>
      </div>

      <div className="rounded-lg border border-ink-200 p-4 dark:border-ink-800">
        <Markdown>{task.instructions}</Markdown>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Atribuir</h2>
        {task.archived ? (
          <p className="text-sm text-ink-500">Tarefas arquivadas não podem ser atribuídas. Desarquive para atribuir de novo.</p>
        ) : students.content.length === 0 ? (
          <p className="text-sm text-ink-500">
            Você não tem alunos ativos. <Link href="/students/new" className="text-brand-600 hover:underline">Cadastre um aluno</Link> primeiro.
          </p>
        ) : (
          <AssignForm taskId={task.id} students={students.content.map((s) => ({ id: s.id, name: s.name }))} timeZone={zone} />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Atribuída a ({assignments.totalElements})</h2>
        {assignments.content.length === 0 ? (
          <p className="text-sm text-ink-500">Ainda não atribuída.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-200 text-ink-500 dark:border-ink-800">
              <tr>
                <th className="py-2 font-bold">Aluno</th>
                <th className="py-2 font-bold">Prazo</th>
                <th className="py-2 font-bold">Situação</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {assignments.content.map((a) => (
                <tr key={a.id} className="border-b border-ink-100 dark:border-ink-900">
                  <td className="py-2">{a.studentName}</td>
                  <td className="py-2">{a.dueAt ? formatDateTime(a.dueAt, zone) : <span className="text-ink-500">Sem prazo</span>}</td>
                  <td className="py-2"><AssignmentStatusBadge assignment={a} /></td>
                  <td className="py-2 text-right">
                    {a.status === "ASSIGNED" ? (
                      <UnassignButton id={a.id} studentName={a.studentName} />
                    ) : (
                      <Link href={`/grading/${a.id}`} className="text-sm font-bold text-brand-600 hover:underline">
                        {a.status === "GRADED" ? "Revisar nota" : "Corrigir"}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
