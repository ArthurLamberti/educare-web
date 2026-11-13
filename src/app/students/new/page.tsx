import type { Metadata } from "next";

import { StudentForm } from "@/components/student-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New student" };

export default async function NewStudentPage() {
  await requireUser(["ADMIN", "TEACHER"]);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New student</h1>
      <StudentForm />
    </section>
  );
}
