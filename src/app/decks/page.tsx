import type { Metadata } from "next";
import Link from "next/link";

import { requireUser, type User } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { listDecks } from "@/lib/decks";

export const metadata: Metadata = { title: "Flashcards" };

const PAGE_SIZE = 20;

/** Teachers: their decks (archived on request). Students: decks proposed to them. Admins: all, read-only. */
export default async function DecksPage({ searchParams }: PageProps<"/decks">) {
  const user = await requireUser();
  const { archived, page } = await searchParams;
  const includeArchived = archived === "1";
  const pageNumber = Math.max(0, Number(page) || 0);
  const decks = await listDecks({ includeArchived, page: pageNumber, size: PAGE_SIZE });

  const link = (changes: { archived?: boolean; page?: number }) => {
    const params = new URLSearchParams();
    if (changes.archived ?? includeArchived) params.set("archived", "1");
    if (changes.page) params.set("page", String(changes.page));
    const q = params.toString();
    return q ? `/decks?${q}` : "/decks";
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user.role === "STUDENT" ? "My flashcards" : "Flashcards"}</h1>
        {user.role === "TEACHER" && (
          <Link href="/decks/new" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            New deck
          </Link>
        )}
      </div>

      {user.role === "STUDENT" ? (
        <StudentDecks decks={decks.content} />
      ) : (
        <>
          <Link href={link({ archived: !includeArchived })} className="flex items-center gap-2 text-sm" role="checkbox" aria-checked={includeArchived}>
            <span className={`inline-block h-4 w-4 rounded border ${includeArchived ? "border-indigo-600 bg-indigo-600" : "border-zinc-400"}`} />
            Show archived
          </Link>
          <TeacherDecks decks={decks.content} user={user} includeArchived={includeArchived} />
        </>
      )}

      {decks.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Page {decks.number + 1} of {decks.totalPages}</span>
          <div className="flex gap-2">
            {decks.number > 0 && <Link href={link({ page: decks.number - 1 })} className="hover:underline">← Previous</Link>}
            {decks.number + 1 < decks.totalPages && <Link href={link({ page: decks.number + 1 })} className="hover:underline">Next →</Link>}
          </div>
        </div>
      )}
    </section>
  );
}

type Decks = Awaited<ReturnType<typeof listDecks>>["content"];

function TeacherDecks({ decks, user, includeArchived }: { decks: Decks; user: User; includeArchived: boolean }) {
  if (decks.length === 0) {
    return (
      <p className="text-zinc-500">
        {user.role === "TEACHER" ? (
          <>
            {includeArchived ? "No decks yet." : "No active decks."}{" "}
            <Link href="/decks/new" className="text-indigo-600 hover:underline">Create a deck</Link>
            {!includeArchived && " or show archived ones"}.
          </>
        ) : (
          "No decks."
        )}
      </p>
    );
  }
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
        <tr>
          <th className="py-2 font-medium">Deck</th>
          {user.role === "ADMIN" && <th className="py-2 font-medium">Teacher</th>}
          <th className="py-2 text-right font-medium">Cards</th>
          <th className="py-2 text-right font-medium">Students</th>
          <th className="py-2 pl-6 font-medium">Last update</th>
        </tr>
      </thead>
      <tbody>
        {decks.map((d) => (
          <tr key={d.id} className="border-b border-zinc-100 dark:border-zinc-900">
            <td className="py-2">
              <Link href={`/decks/${d.id}`} className="font-medium hover:text-indigo-600 hover:underline">
                {d.title}
              </Link>
              {d.archived && <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Archived</span>}
            </td>
            {user.role === "ADMIN" && <td className="py-2">{d.teacherName}</td>}
            <td className="py-2 text-right">{d.cardCount}</td>
            <td className="py-2 text-right">{d.studentCount}</td>
            <td className="py-2 pl-6 text-zinc-600 dark:text-zinc-400">{formatDateTime(d.updatedAt, user.tenant.timeZone)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StudentDecks({ decks }: { decks: Decks }) {
  if (decks.length === 0) return <p className="text-zinc-500">Your teacher has not proposed any flashcards yet.</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {decks.map((d) => (
        <li key={d.id}>
          <Link href={`/decks/${d.id}`} className="flex h-full flex-col gap-1 rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <span className="font-semibold">{d.title}</span>
            {d.description && <span className="text-sm text-zinc-600 dark:text-zinc-400">{d.description}</span>}
            <span className="mt-auto pt-2 text-xs text-zinc-500">
              {d.cardCount} {d.cardCount === 1 ? "card" : "cards"} · {d.teacherName}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
