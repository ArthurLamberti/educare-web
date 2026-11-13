import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StudentForm } from "@/components/student-form";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getStudent } from "@/lib/students";

export const metadata: Metadata = { title: "Edit student" };

export default async function EditStudentPage({ params }: PageProps<"/students/[id]/edit">) {
  await requireUser(["ADMIN", "TEACHER"]);
  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) notFound();

  const student = await getStudent(studentId).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Edit student</h1>
      <StudentForm student={student} />
    </section>
  );
}
