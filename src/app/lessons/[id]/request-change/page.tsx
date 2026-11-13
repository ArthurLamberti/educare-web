import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RequestChangeForm } from "@/components/request-change-form";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { formatDateTime, formatTime } from "@/lib/datetime";
import { getLesson } from "@/lib/lessons";
import { lessonsWithPendingRequest, requestDeadline, requestWindowClosed } from "@/lib/reschedule-requests";

export const metadata: Metadata = { title: "Pedir novo horário" };

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
      <h1 className="text-2xl font-bold">Pedir novo horário</h1>
      <div className="rounded-lg border border-ink-200 p-4 text-sm dark:border-ink-800">
        <p className="font-bold">{lesson.topic}</p>
        <p className="text-ink-600 dark:text-ink-400">
          {formatDateTime(lesson.startsAt, zone)}–{formatTime(lesson.endsAt, zone)} com {lesson.teacherName}
        </p>
      </div>

      {lesson.status !== "SCHEDULED" ? (
        <p className="text-ink-500">Esta aula foi cancelada.</p>
      ) : pending.includes(lesson.id) ? (
        <p className="text-ink-500">
          Esta aula já tem um pedido pendente. Veja <Link href="/requests" className="text-brand-600 hover:underline">seus pedidos</Link>.
        </p>
      ) : tooLate ? (
        <p className="text-ink-500">
          Mudanças precisam ser pedidas com pelo menos 2 dias de antecedência (prazo: {formatDateTime(deadline.toISOString(), zone)}).
        </p>
      ) : (
        <>
          <p className="text-sm text-ink-500">
            Seu professor vai aprovar ou recusar. Você pode pedir até {formatDateTime(deadline.toISOString(), zone)}.
          </p>
          <RequestChangeForm lessonId={lesson.id} timeZone={zone} />
        </>
      )}
    </section>
  );
}
