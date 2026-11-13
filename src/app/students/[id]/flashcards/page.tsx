import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BulkCardForm } from "@/components/bulk-card-form";
import { AddCardForm, CardEditor } from "@/components/card-editor";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { cardStage, listStudentCards } from "@/lib/flashcards";
import { getStudent } from "@/lib/students";

export const metadata: Metadata = { title: "Flashcards do aluno" };

/** The student's own words. Their teacher adds, edits and deletes them; admins only read. */
export default async function StudentFlashcardsPage({ params }: PageProps<"/students/[id]/flashcards">) {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const studentId = Number((await params).id);
  if (!Number.isInteger(studentId)) notFound();
  const notFoundOn404 = (error: unknown): never => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  };
  const [student, cards] = await Promise.all([getStudent(studentId).catch(notFoundOn404), listStudentCards(studentId).catch(notFoundOn404)]);
  const editable = user.role === "TEACHER";
  const stages = cards.map(cardStage);
  const count = (stage: string) => stages.filter((s) => s === stage).length;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <Link href="/flashcards" className="text-sm text-ink-500 hover:underline">← Flashcards</Link>
        <h1 className="text-2xl font-bold">Flashcards de {student.name}</h1>
        <p className="text-sm text-ink-500">
          {cards.length} {cards.length === 1 ? "palavra" : "palavras"}: {count("Novo")} {count("Novo") === 1 ? "nova" : "novas"},{" "}
          {count("Aprendendo")} aprendendo, {count("Maduro")} {count("Maduro") === 1 ? "madura" : "maduras"}.
          {" "}O aluno recebe até 20 palavras novas por dia.
        </p>
      </div>

      {editable && (
        <div className="grid gap-4 md:grid-cols-2">
          <AddCardForm studentId={studentId} />
          <BulkCardForm studentId={studentId} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Palavras</h2>
        <CardEditor
          cards={cards.map((c, i) => ({ id: c.id, front: c.front, back: c.back, stage: stages[i], dueAt: c.dueAt }))}
          timeZone={user.tenant.timeZone}
          editable={editable}
        />
      </div>
    </section>
  );
}
