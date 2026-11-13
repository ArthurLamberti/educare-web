import type { Metadata } from "next";

import { TeacherForm } from "@/components/teacher-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Novo professor" };

export default async function NewTeacherPage() {
  await requireUser(["ADMIN"]);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Novo professor</h1>
      <TeacherForm />
    </section>
  );
}
