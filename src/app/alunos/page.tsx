import type { Metadata } from "next";
import Link from "next/link";

import { DeleteAlunoButton } from "@/components/delete-aluno-button";
import { listarAlunos } from "@/lib/alunos";

export const metadata: Metadata = { title: "Alunos" };

const PAGE_SIZE = 20;

export default async function AlunosPage({ searchParams }: PageProps<"/alunos">) {
  const { page } = await searchParams;
  const pagina = Math.max(0, Number(page) || 0);
  const alunos = await listarAlunos(pagina, PAGE_SIZE);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alunos</h1>
        <Link href="/alunos/novo" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Novo aluno
        </Link>
      </div>

      {alunos.content.length === 0 ? (
        <p className="text-zinc-500">Nenhum aluno cadastrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Nascimento</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {alunos.content.map((aluno) => (
                <tr key={aluno.id}>
                  <td className="px-4 py-3">{aluno.nome}</td>
                  <td className="px-4 py-3">{aluno.email}</td>
                  <td className="px-4 py-3">{formatarData(aluno.dataNascimento)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      <Link href={`/alunos/${aluno.id}/editar`} className="text-sm font-medium text-indigo-600 hover:underline">
                        Editar
                      </Link>
                      <DeleteAlunoButton id={aluno.id} nome={aluno.nome} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {alunos.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Página {alunos.number + 1} de {alunos.totalPages} · {alunos.totalElements} alunos
          </span>
          <div className="flex gap-2">
            {alunos.number > 0 && <Link href={`/alunos?page=${alunos.number - 1}`} className="hover:underline">← Anterior</Link>}
            {alunos.number + 1 < alunos.totalPages && <Link href={`/alunos?page=${alunos.number + 1}`} className="hover:underline">Próxima →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}

function formatarData(iso: string | null) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}
