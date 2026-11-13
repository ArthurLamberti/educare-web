import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RequestChangeForm } from "@/components/request-change-form";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { formatDateTime, formatTime } from "@/lib/datetime";
import { getLesson } from "@/lib/lessons";
import { lessonsWithPendingRequest, requestDeadline, requestWindowClosed } from "@/lib/reschedule-requests";

export const metadata: Metadata = { title: "Request new time" };

export default async function RequestChangePage({ params }: PageProps<"/lessons/[id]/request-change">) {
  const user = await requireUser(["STUDENT"]);
  const zone = user.tenant.timeZone;
  const { id } = await params;
  const lessonId = Number(id);
  if (!Number.isInteger(lessonId)) notFound();

  const [lesson, pending] = await Promise.all([
    getLesson(lessonId).catch((error) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    lessonsWithPendingRequest(),
  ]);
  const deadline = requestDeadline(lesson.startsAt);
  const tooLate = requestWindowClosed(lesson.startsAt);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Request new time</h1>
      <div className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <p className="font-medium">{lesson.topic}</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          {formatDateTime(lesson.startsAt, zone)}–{formatTime(lesson.endsAt, zone)} with {lesson.teacherName}
        </p>
      </div>

      {lesson.status !== "SCHEDULED" ? (
        <p className="text-zinc-500">This lesson was canceled.</p>
      ) : pending.includes(lesson.id) ? (
        <p className="text-zinc-500">
          This lesson already has a pending request. See <Link href="/requests" className="text-indigo-600 hover:underline">your requests</Link>.
        </p>
      ) : tooLate ? (
        <p className="text-zinc-500">
          Changes must be requested at least 2 days before the lesson (deadline: {formatDateTime(deadline.toISOString(), zone)}).
        </p>
      ) : (
        <>
          <p className="text-sm text-zinc-500">
            Your teacher will approve or reject it. You can ask until {formatDateTime(deadline.toISOString(), zone)}.
          </p>
          <RequestChangeForm lessonId={lesson.id} timeZone={zone} />
        </>
      )}
    </section>
  );
}
