import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonAnnotationsForm } from "@/components/lesson-annotations-form";
import { LessonWordList, LessonWords } from "@/components/lesson-words";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { formatDateTime, formatTime } from "@/lib/datetime";
import { lessonRoomPath } from "@/lib/lesson-room";
import { getLesson, getLessonWords } from "@/lib/lessons";

export const metadata: Metadata = { title: "Aula" };

/** A lesson: when, with whom, the room link of an online lesson and the teacher's notes. */
export default async function LessonPage({ params }: PageProps<"/lessons/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const lessonId = Number(id);
  if (!Number.isInteger(lessonId)) notFound();
  const [lesson, words] = await Promise.all([getLesson(lessonId), getLessonWords(lessonId)]).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  const zone = user.tenant.timeZone;
  const isTeacher = user.role === "TEACHER" && lesson.teacherId === user.id;
  const scheduled = lesson.status === "SCHEDULED";

  return (
    <section className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link href="/lessons" className="text-sm font-bold text-brand-600 hover:underline">
          ← Aulas
        </Link>
        <h1 className="text-3xl">{lesson.topic}</h1>
        <p className="text-ink-700 dark:text-ink-300">
          {formatDateTime(lesson.startsAt, zone)}–{formatTime(lesson.endsAt, zone)}
          {lesson.status === "CANCELED" && <span className="ml-2 font-bold text-red-600">(cancelada)</span>}
        </p>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          Professor: {lesson.teacherName} · Aluno: {lesson.studentName}
          {lesson.seriesId !== null && " · ↻ Semanal"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-ink-200 px-4 py-3 dark:border-ink-800">
        {lesson.virtualRoom || lesson.meetingUrl ? (
          <>
            <span className="font-bold">Aula online</span>
            {scheduled && (
              <a
                href={lessonRoomPath(lesson.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500"
              >
                Entrar na sala
              </a>
            )}
            {lesson.meetingUrl && <span className="min-w-0 truncate font-mono text-xs text-ink-500">{lesson.meetingUrl}</span>}
          </>
        ) : (
          <span className="font-bold">Aula presencial</span>
        )}
        {isTeacher && scheduled && (
          <Link href={`/lessons/${lesson.id}/edit`} className="ml-auto text-sm font-bold text-brand-600 hover:underline">
            Editar aula
          </Link>
        )}
      </div>

      {lesson.notes && (
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-ink-500">Observações</h2>
          <p className="whitespace-pre-wrap">{lesson.notes}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-xl">Anotações da aula</h2>
        {isTeacher ? (
          <>
            <p className="text-sm text-ink-500">Escreva durante ou depois da aula. {lesson.studentName.split(" ")[0]} vê estas anotações.</p>
            <LessonAnnotationsForm lessonId={lesson.id} text={lesson.annotations ?? ""} timeZone={zone} />
          </>
        ) : lesson.annotations ? (
          <>
            <p className="rounded-md border border-ink-200 bg-white px-4 py-3 whitespace-pre-wrap dark:border-ink-800 dark:bg-ink-900">{lesson.annotations}</p>
            {lesson.annotationsUpdatedAt && (
              <p className="text-xs text-ink-500">Atualizado em {formatDateTime(lesson.annotationsUpdatedAt, zone)}</p>
            )}
          </>
        ) : (
          <p className="text-ink-500">O professor ainda não fez anotações sobre esta aula.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl">Palavras novas</h2>
        {isTeacher ? (
          <>
            <p className="text-sm text-ink-500">
              Liste o vocabulário novo da aula e envie para os flashcards de {lesson.studentName.split(" ")[0]} ou como tarefa de escrever frases.
            </p>
            <LessonWords lessonId={lesson.id} studentId={lesson.studentId} studentName={lesson.studentName} words={words} timeZone={zone} />
          </>
        ) : (
          <LessonWordList words={words} />
        )}
      </div>
    </section>
  );
}
