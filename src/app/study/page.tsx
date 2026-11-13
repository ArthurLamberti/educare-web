import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StudySession } from "@/components/study-session";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getQueue } from "@/lib/reviews";

export const metadata: Metadata = { title: "Study" };

/** Study session for all decks, or one deck with `?deck=`. */
export default async function StudyPage({ searchParams }: PageProps<"/study">) {
  const user = await requireUser(["STUDENT"]);
  const { deck } = await searchParams;
  const deckId = Number(deck) > 0 ? Number(deck) : null;
  const queue = await getQueue(deckId ?? undefined).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  const title = deckId ? (queue.cards[0]?.deckTitle ?? "Study") : "Study all decks";

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/decks" className="text-sm text-zinc-500 hover:underline">← Flashcards</Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-xs text-zinc-500">
          {queue.dueCount} to review · {queue.newCount} new · keys: Space shows the answer, 1-4 rate
        </p>
      </div>
      <StudySession initial={queue} deckId={deckId} timeZone={user.tenant.timeZone} />
    </section>
  );
}
