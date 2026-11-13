import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LessonForm } from "@/components/lesson-form";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { instantToZonedParts } from "@/lib/datetime";
import { getLesson } from "@/lib/lessons";

export const metadata: Metadata = { title: "Editar aula" };

export default async function EditLessonPage({ params }: PageProps<"/lessons/[id]/edit">) {
  const user = await requireUser(["TEACHER"]);
  const { id } = await params;
  const lessonId = Number(id);
  if (!Number.isInteger(lessonId)) notFound();

  const lesson = await getLesson(lessonId).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  if (lesson.status !== "SCHEDULED") redirect("/lessons?view=canceled");

  const { date, time } = instantToZonedParts(lesson.startsAt, user.tenant.timeZone);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Editar aula</h1>
      <LessonForm
        lesson={{ id: lesson.id, studentName: lesson.studentName, date, time, durationMinutes: lesson.durationMinutes, topic: lesson.topic, notes: lesson.notes }}
        timeZone={user.tenant.timeZone}
      />
    </section>
  );
}
