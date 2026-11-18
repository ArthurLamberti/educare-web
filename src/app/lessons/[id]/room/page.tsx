import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LessonRoom } from "@/components/lesson-room";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { formatTime } from "@/lib/datetime";
import { getLesson, getLessonRoom } from "@/lib/lessons";

export const metadata: Metadata = { title: "Sala da aula" };

/**
 * "Entrar na sala": the call runs inside Educare, so the video provider is an API detail (it builds a link
 * for this user at join time) and can change without anything changing here. Lessons with the teacher's
 * own link (Zoom, Meet...) go to that link; lessons that cannot be joined go back to the lesson page.
 */
export default async function LessonRoomPage({ params }: PageProps<"/lessons/[id]/room">) {
  const user = await requireUser(["TEACHER", "STUDENT"]);
  const { id } = await params;
  const lessonId = Number(id);
  if (!Number.isInteger(lessonId)) notFound();

  let lesson, room;
  try {
    [lesson, room] = await Promise.all([getLesson(lessonId), getLessonRoom(lessonId)]);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 409)) redirect(`/lessons/${lessonId}`);
    if (error instanceof ApiError && error.status === 503) return <Unavailable lessonId={lessonId} />;
    throw error;
  }
  if (!room.embedded) redirect(room.url);
  if (room.provider !== "livekit") return <Unavailable lessonId={lessonId} />;

  const zone = user.tenant.timeZone;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <Link href={`/lessons/${lesson.id}`} className="text-sm font-bold text-brand-600 hover:underline">
          ← Sair da sala
        </Link>
        <h1 className="text-2xl">{lesson.topic}</h1>
        <span className="text-sm text-ink-600 dark:text-ink-400">
          {formatTime(lesson.startsAt, zone)}–{formatTime(lesson.endsAt, zone)} ·{" "}
          {user.role === "TEACHER" ? `Aluno: ${lesson.studentName}` : `Professor: ${lesson.teacherName}`}
        </span>
      </div>
      <LessonRoom serverUrl={room.url} token={room.token} leaveHref={`/lessons/${lesson.id}`} />
    </section>
  );
}

function Unavailable({ lessonId }: { lessonId: number }) {
  return (
    <section className="flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl">A sala não está disponível agora</h1>
      <p className="text-ink-700 dark:text-ink-300">Tente novamente em alguns instantes. Se continuar, avise o suporte.</p>
      <div className="flex gap-4">
        <Link href={`/lessons/${lessonId}/room`} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500">
          Tentar de novo
        </Link>
        <Link href={`/lessons/${lessonId}`} className="rounded-md px-4 py-2 text-sm font-bold text-brand-600 hover:underline">
          Voltar para a aula
        </Link>
      </div>
    </section>
  );
}
