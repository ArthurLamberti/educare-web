"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { atualizarAluno, criarAluno, removerAluno, type AlunoRequest } from "@/lib/alunos";
import { ApiError } from "@/lib/api";

export type AlunoFormState = {
  message?: string;
  errors?: Partial<Record<keyof AlunoRequest, string>>;
  values?: Partial<Record<keyof AlunoRequest, string>>;
};

function lerFormulario(formData: FormData): AlunoRequest {
  const dataNascimento = String(formData.get("dataNascimento") ?? "").trim();
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    dataNascimento: dataNascimento || null,
  };
}

function falha(error: unknown, data: AlunoRequest): AlunoFormState {
  const values = { ...data, dataNascimento: data.dataNascimento ?? "" };
  if (error instanceof ApiError) {
    return { message: error.message, errors: error.problem.erros, values };
  }
  return {
    message: error instanceof Error ? error.message : "Erro inesperado",
    values,
  };
}

export async function salvarAluno(
  id: number | null,
  _prev: AlunoFormState,
  formData: FormData,
): Promise<AlunoFormState> {
  const data = lerFormulario(formData);
  try {
    if (id === null) await criarAluno(data);
    else await atualizarAluno(id, data);
  } catch (error) {
    return falha(error, data);
  }
  redirect("/alunos");
}

export async function excluirAluno(id: number) {
  await removerAluno(id);
  refresh();
}
