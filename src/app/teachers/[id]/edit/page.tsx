import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TeacherForm } from "@/components/teacher-form";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getTeacher } from "@/lib/teachers";

export const metadata: Metadata = { title: "Editar professor" };

export default async function EditTeacherPage({ params }: PageProps<"/teachers/[id]/edit">) {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const teacherId = Number(id);
  if (!Number.isInteger(teacherId)) notFound();

  const teacher = await getTeacher(teacherId).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Editar professor</h1>
      <TeacherForm teacher={teacher} />
    </section>
  );
}
