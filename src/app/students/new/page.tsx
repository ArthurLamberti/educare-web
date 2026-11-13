import type { Metadata } from "next";

import { StudentForm } from "@/components/student-form";

export const metadata: Metadata = { title: "New student" };

export default function NewStudentPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New student</h1>
      <StudentForm />
    </section>
  );
}
