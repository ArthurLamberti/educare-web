import type { Metadata } from "next";
import Link from "next/link";

import { listAssignments } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";

export const metadata: Metadata = { title: "Para corrigir" };

const PAGE_SIZE = 20;

/** Submitted work of the teacher's tasks, oldest submission first. */
export default async function GradingPage({ searchParams }: PageProps<"/grading">) {
  const user = await requireUser(["TEACHER"]);
  const zone = user.tenant.timeZone;
  const { page, graded } = await searchParams;
  const pageNumber = Math.max(0, Number(page) || 0);
  const queue = await listAssignments({ statuses: ["SUBMITTED"], page: pageNumber, size: PAGE_SIZE });

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Para corrigir ({queue.totalElements})</h1>
      {graded && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Nota salva. O aluno já pode ver.
        </p>
      )}
      <p className="text-xs text-ink-500">Entregas mais antigas primeiro. Horários no fuso da escola ({zone.replaceAll("_", " ")}).</p>

      {queue.content.length === 0 ? (
        <p className="text-ink-500">
          Nada para corrigir. As atividades corrigidas ficam em <Link href="/assignments?status=GRADED" className="text-brand-600 hover:underline">Atividades</Link>.
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-200 text-ink-500 dark:border-ink-800">
            <tr>
              <th className="py-2 font-bold">Entregue em</th>
              <th className="py-2 font-bold">Aluno</th>
              <th className="py-2 font-bold">Tarefa</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {queue.content.map((a) => (
              <tr key={a.id} className="border-b border-ink-100 dark:border-ink-900">
                <td className="py-2">
                  {a.submission && formatDateTime(a.submission.submittedAt, zone)}
                  {a.submission?.late && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">Atrasada</span>
                  )}
                </td>
                <td className="py-2">{a.studentName}</td>
                <td className="py-2">{a.taskTitle}</td>
                <td className="py-2 text-right">
                  <Link href={`/grading/${a.id}`} className="font-bold text-brand-600 hover:underline">
                    Corrigir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {queue.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">Página {queue.number + 1} de {queue.totalPages}</span>
          <div className="flex gap-2">
            {queue.number > 0 && <Link href={`/grading?page=${queue.number - 1}`} className="hover:underline">← Anterior</Link>}
            {queue.number + 1 < queue.totalPages && <Link href={`/grading?page=${queue.number + 1}`} className="hover:underline">Próxima →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}
