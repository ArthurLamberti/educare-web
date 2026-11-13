import type { Metadata } from "next";

import { TeacherForm } from "@/components/teacher-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New teacher" };

export default async function NewTeacherPage() {
  await requireUser(["ADMIN"]);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New teacher</h1>
      <TeacherForm />
    </section>
  );
}
