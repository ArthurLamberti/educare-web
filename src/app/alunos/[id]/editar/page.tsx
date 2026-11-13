import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AlunoForm } from "@/components/aluno-form";
import { buscarAluno } from "@/lib/alunos";
import { ApiError } from "@/lib/api";

export const metadata: Metadata = { title: "Editar aluno" };

export default async function EditarAlunoPage({ params }: PageProps<"/alunos/[id]/editar">) {
  const { id } = await params;
  const alunoId = Number(id);
  if (!Number.isInteger(alunoId)) notFound();

  const aluno = await buscarAluno(alunoId).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Editar aluno</h1>
      <AlunoForm aluno={aluno} />
    </section>
  );
}
