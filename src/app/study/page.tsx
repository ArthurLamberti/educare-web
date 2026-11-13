import type { Metadata } from "next";
import Link from "next/link";

import { StudySession } from "@/components/study-session";
import { requireUser } from "@/lib/auth";
import { getQueue } from "@/lib/reviews";

export const metadata: Metadata = { title: "Estudar" };

/** Study session over the student's own cards. */
export default async function StudyPage() {
  const user = await requireUser(["STUDENT"]);
  const queue = await getQueue();

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/flashcards" className="text-sm text-ink-500 hover:underline">← Flashcards</Link>
        <h1 className="text-2xl font-bold">Estudar</h1>
        <p className="text-xs text-ink-500">
          {queue.dueCount} para revisar, {queue.newCount} {queue.newCount === 1 ? "novo" : "novos"}. Atalhos: Espaço mostra a resposta, 1 a 4 avaliam.
        </p>
      </div>
      <StudySession initial={queue} timeZone={user.tenant.timeZone} />
    </section>
  );
}
