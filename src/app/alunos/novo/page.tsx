import type { Metadata } from "next";

import { AlunoForm } from "@/components/aluno-form";

export const metadata: Metadata = { title: "Novo aluno" };

export default function NovoAlunoPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Novo aluno</h1>
      <AlunoForm />
    </section>
  );
}
