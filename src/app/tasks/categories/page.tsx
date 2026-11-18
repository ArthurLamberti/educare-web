import type { Metadata } from "next";
import Link from "next/link";

import { CategoryManager } from "@/components/category-manager";
import { requireUser } from "@/lib/auth";
import { listTaskCategories } from "@/lib/task-categories";

export const metadata: Metadata = { title: "Categorias" };

/** The teacher's own task categories: create, rename and delete. */
export default async function CategoriesPage() {
  await requireUser(["TEACHER"]);
  const categories = await listTaskCategories();
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/tasks" className="text-sm text-ink-500 hover:underline">← Tarefas</Link>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-sm text-ink-500">Organize suas tarefas do seu jeito. Só você vê as suas categorias.</p>
      </div>
      <CategoryManager categories={categories} />
    </section>
  );
}
