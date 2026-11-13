import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";

export type Aluno = {
  id: number;
  nome: string;
  email: string;
  /** ISO date (yyyy-MM-dd) */
  dataNascimento: string | null;
  /** ISO instant */
  criadoEm: string;
};

export type AlunoRequest = {
  nome: string;
  email: string;
  dataNascimento: string | null;
};

export async function listarAlunos(page = 0, size = 20): Promise<Page<Aluno>> {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort: "nome" });
  return normalizePage(await apiFetch(`/api/alunos?${params}`));
}

export function buscarAluno(id: number): Promise<Aluno> {
  return apiFetch(`/api/alunos/${id}`);
}

export function criarAluno(data: AlunoRequest): Promise<Aluno> {
  return apiFetch("/api/alunos", { method: "POST", body: JSON.stringify(data) });
}

export function atualizarAluno(id: number, data: AlunoRequest): Promise<Aluno> {
  return apiFetch(`/api/alunos/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function removerAluno(id: number): Promise<void> {
  return apiFetch(`/api/alunos/${id}`, { method: "DELETE" });
}
