import type { Metadata } from "next";
import Link from "next/link";

import { CardEditor } from "@/components/card-editor";
import { requireUser, type User } from "@/lib/auth";
import { cardStage, listFlashcardProgress, listMyCards, toReviewToday } from "@/lib/flashcards";
import { getStudentProgress } from "@/lib/reviews";

export const metadata: Metadata = { title: "Flashcards" };

/** Students: their words and the study button. Teachers: each of their students; admins: all students. */
export default async function FlashcardsPage() {
  const user = await requireUser();
  return user.role === "STUDENT" ? <MyFlashcards user={user} /> : <StudentsOverview user={user} />;
}

async function MyFlashcards({ user }: { user: User }) {
  const [progress, cards] = await Promise.all([getStudentProgress(), listMyCards()]);
  const today = toReviewToday(progress);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Meus flashcards</h1>
          <p className="text-sm text-ink-500">
            {cards.length} {cards.length === 1 ? "palavra" : "palavras"}, {progress.reviewsLast7Days} {progress.reviewsLast7Days === 1 ? "revisão" : "revisões"} nos últimos 7 dias.
          </p>
        </div>
        {today > 0 ? (
          <Link href="/study" className="rounded-md bg-brand-600 px-5 py-2.5 font-bold text-white hover:bg-brand-500">
            Estudar ({today})
          </Link>
        ) : (
          cards.length > 0 && <span className="text-green-700 dark:text-green-400">Tudo feito por hoje.</span>
        )}
      </div>
      {cards.length === 0 ? (
        <p className="text-ink-500">Seu professor ainda não cadastrou palavras para você.</p>
      ) : (
        <CardEditor
          cards={cards.map((c) => ({ id: c.id, front: c.front, back: c.back, stage: cardStage(c), dueAt: c.dueAt }))}
          timeZone={user.tenant.timeZone}
          editable={false}
        />
      )}
    </section>
  );
}

async function StudentsOverview({ user }: { user: User }) {
  const progress = await listFlashcardProgress();
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <p className="text-sm text-ink-500">
          Cada aluno tem a própria lista de palavras.{user.role === "TEACHER" && " Abra um aluno para cadastrar palavras."}
        </p>
      </div>
      {progress.length === 0 ? (
        <p className="text-ink-500">
          Nenhum aluno ativo.
          {user.role === "TEACHER" && (
            <>
              {" "}
              <Link href="/students/new" className="text-brand-600 hover:underline">Cadastre um aluno</Link>.
            </>
          )}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-200 text-ink-500 dark:border-ink-800">
              <tr>
                <th className="py-2 font-bold">Aluno</th>
                <th className="py-2 text-right font-bold">Palavras</th>
                <th className="py-2 text-right font-bold">Novas</th>
                <th className="py-2 text-right font-bold" title="Intervalo menor que 21 dias">Aprendendo</th>
                <th className="py-2 text-right font-bold" title="Intervalo de 21 dias ou mais">Maduras</th>
                <th className="py-2 text-right font-bold">Para hoje</th>
                <th className="py-2 text-right font-bold">Revisões (7 dias)</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p) => (
                <tr key={p.studentId} className="border-b border-ink-100 dark:border-ink-900">
                  <td className="py-2">
                    <Link href={`/students/${p.studentId}/flashcards`} className="font-bold hover:text-brand-600 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-2 text-right tabular-nums">{p.cards}</td>
                  <td className="py-2 text-right tabular-nums">{p.newCards}</td>
                  <td className="py-2 text-right tabular-nums">{p.learning}</td>
                  <td className="py-2 text-right tabular-nums">{p.mature}</td>
                  <td className="py-2 text-right tabular-nums">{p.dueToday}</td>
                  <td className="py-2 text-right tabular-nums">{p.reviewsLast7Days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
