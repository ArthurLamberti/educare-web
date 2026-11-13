import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DeckForm } from "@/components/deck-form";
import { ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getDeck } from "@/lib/decks";

export const metadata: Metadata = { title: "Edit deck" };

export default async function EditDeckPage({ params }: PageProps<"/decks/[id]/edit">) {
  await requireUser(["TEACHER"]);
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const deck = await getDeck(id).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Edit deck</h1>
      <DeckForm deck={deck} />
    </section>
  );
}
