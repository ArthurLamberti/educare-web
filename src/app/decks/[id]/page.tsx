import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CardEditor } from "@/components/card-editor";
import { DeckArchiveButton } from "@/components/deck-archive-button";
import { DeckStudents } from "@/components/deck-students";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getDeck, listCards, listDeckStudents } from "@/lib/decks";
import { listStudents } from "@/lib/students";

export const metadata: Metadata = { title: "Deck" };

/** The owner edits cards and chooses students; students and admins browse the cards read-only. */
export default async function DeckPage({ params, searchParams }: PageProps<"/decks/[id]">) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { created } = await searchParams;
  const notFoundOn404 = (error: unknown): never => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  };

  const [deck, cards] = await Promise.all([getDeck(id).catch(notFoundOn404), listCards(id).catch(notFoundOn404)]);
  const isOwner = user.role === "TEACHER" && deck.teacherId === user.id;
  const [deckStudents, ownStudents] = isOwner ? await Promise.all([listDeckStudents(id), listStudents(0, 200)]) : [[], null];
  const assigned = new Set(deckStudents.map((s) => s.studentId));

  return (
    <section className="flex flex-col gap-8">
      {created && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Deck created. Add its cards below.
        </p>
      )}

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/decks" className="text-sm text-zinc-500 hover:underline">← Flashcards</Link>
          <h1 className="text-2xl font-bold">
            {deck.title}
            {deck.archived && <span className="ml-3 rounded-full bg-zinc-100 px-2 py-0.5 align-middle text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Archived</span>}
          </h1>
          {deck.description && <p className="text-sm text-zinc-600 dark:text-zinc-400">{deck.description}</p>}
          <span className="text-xs text-zinc-500">
            {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
            {!isOwner && ` · ${deck.teacherName}`}
          </span>
        </div>
        {isOwner && (
          <div className="ml-auto flex items-start gap-2">
            <Link href={`/decks/${deck.id}/edit`} className="rounded-md px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950">
              Edit
            </Link>
            <DeckArchiveButton id={deck.id} archived={deck.archived} />
          </div>
        )}
      </div>

      {isOwner ? (
        <>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Cards</h2>
            <CardEditor deckId={deck.id} cards={cards.map(({ id, front, back }) => ({ id, front, back }))} />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Students ({deckStudents.length})</h2>
            <DeckStudents
              deckId={deck.id}
              students={deckStudents}
              available={(ownStudents?.content ?? []).filter((s) => !assigned.has(s.id)).map((s) => ({ id: s.id, name: s.name }))}
              archived={deck.archived}
            />
          </div>
        </>
      ) : cards.length === 0 ? (
        <p className="text-zinc-500">This deck has no cards yet.</p>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-2">
          {cards.map((c, i) => (
            <li key={c.id} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
              <span className="text-xs text-zinc-400">{i + 1}</span>
              <span className="font-medium break-words whitespace-pre-wrap">{c.front}</span>
              <span className="border-t border-zinc-100 pt-2 break-words whitespace-pre-wrap text-zinc-600 dark:border-zinc-900 dark:text-zinc-400">{c.back}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
