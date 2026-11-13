import Link from "next/link";
import { Suspense } from "react";

import { LessonList } from "@/components/lesson-list";
import { requireUser, type Role, type User } from "@/lib/auth";
import { ROOT_DOMAIN } from "@/lib/host";
import { listLessons } from "@/lib/lessons";
import { getStudentProgress, toReviewToday } from "@/lib/reviews";
import { getTenantSlug } from "@/lib/tenant";

const LINKS: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/teachers", label: "Manage teachers" },
    { href: "/students", label: "View students" },
    { href: "/lessons", label: "View lessons" },
  ],
  TEACHER: [
    { href: "/lessons/new", label: "Schedule a lesson" },
    { href: "/students", label: "View students" },
  ],
  STUDENT: [],
};

export default function Home() {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  if (!(await getTenantSlug())) return <Landing />;
  const user = await requireUser();

  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{user.tenant.name}</p>
      <div className="flex gap-3">
        {LINKS[user.role].map((link) => (
          <Link key={link.href} href={link.href} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            {link.label}
          </Link>
        ))}
      </div>
      {user.role === "STUDENT" && <ReviewReminder />}
      {user.role !== "ADMIN" && <NextLessons user={user} />}
    </section>
  );
}

/** "N cards to review today" for students with flashcards. */
async function ReviewReminder() {
  const progress = await getStudentProgress();
  if (progress.length === 0) return null;
  const count = progress.reduce((sum, p) => sum + toReviewToday(p), 0);
  return count > 0 ? (
    <Link href="/study" className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
      {count} {count === 1 ? "card" : "cards"} to review today →
    </Link>
  ) : (
    <p className="text-sm text-green-700 dark:text-green-400">Flashcards: all done for today.</p>
  );
}

/** Next 5 scheduled lessons of a teacher or student. */
async function NextLessons({ user }: { user: User }) {
  const lessons = await listLessons({ from: new Date(), status: "SCHEDULED", size: 5 });
  return (
    <div className="mt-4 flex w-full flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Next lessons</h2>
        <Link href="/lessons" className="text-sm font-medium text-indigo-600 hover:underline">
          All lessons →
        </Link>
      </div>
      {lessons.content.length === 0 ? (
        <p className="text-sm text-zinc-500">No upcoming lessons.</p>
      ) : (
        <LessonList lessons={lessons.content} role={user.role} timeZone={user.tenant.timeZone} />
      )}
    </div>
  );
}

/** Root domain: no school selected. */
function Landing() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-3xl font-bold">Welcome to Educare</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Each school has its own address. Open the link you received from your school, in the form{" "}
        <code className="font-mono">your-school.{ROOT_DOMAIN}</code>.
      </p>
    </section>
  );
}
