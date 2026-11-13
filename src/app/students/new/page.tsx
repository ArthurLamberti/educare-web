import type { Metadata } from "next";

import { StudentForm } from "@/components/student-form";
import { requireUser } from "@/lib/auth";
import { teacherOptions } from "@/lib/teacher-options";

export const metadata: Metadata = { title: "New student" };

export default async function NewStudentPage() {
  const user = await requireUser(["ADMIN", "TEACHER"]);
  const teachers = user.role === "ADMIN" ? await teacherOptions() : undefined;
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New student</h1>
      <StudentForm teachers={teachers} />
    </section>
  );
}
