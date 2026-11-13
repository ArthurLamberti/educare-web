import type { Metadata } from "next";
import Link from "next/link";

import { LessonForm } from "@/components/lesson-form";
import { requireUser } from "@/lib/auth";
import { listStudents } from "@/lib/students";

export const metadata: Metadata = { title: "New lesson" };

export default async function NewLessonPage() {
  const user = await requireUser(["TEACHER"]);
  const students = await listStudents(0, 200);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New lesson</h1>
      {students.content.length === 0 ? (
        <p className="text-zinc-500">
          You have no active students yet. <Link href="/students/new" className="text-indigo-600 hover:underline">Register a student</Link> first.
        </p>
      ) : (
        <LessonForm students={students.content.map((s) => ({ id: s.id, name: s.name }))} timeZone={user.tenant.timeZone} />
      )}
    </section>
  );
}
