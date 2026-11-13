import type { Metadata } from "next";

import { DeckForm } from "@/components/deck-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New deck" };

export default async function NewDeckPage() {
  await requireUser(["TEACHER"]);
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New deck</h1>
      <DeckForm />
    </section>
  );
}
