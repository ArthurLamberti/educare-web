"use client";

import { useState, useTransition } from "react";

import { createCategoryAction, deleteCategoryAction, renameCategoryAction } from "@/app/tasks/actions";
import { FormMessage, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/form-field";

type Item = { id: number; name: string; taskCount: number };

const linkButton = "text-xs font-bold hover:underline disabled:opacity-50";

/** Create, rename and delete the teacher's categories. */
export function CategoryManager({ categories }: { categories: Item[] }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function create(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await createCategoryAction(name);
      setMessage(result.message);
      if (result.category) setName("");
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <form onSubmit={create} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-bold">
          Nova categoria
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Ex.: Gramática" className={inputClass} />
        </label>
        <button type="submit" disabled={pending || !name.trim()} className={primaryButtonClass}>
          Adicionar
        </button>
      </form>
      <FormMessage message={message} />

      {categories.length === 0 ? (
        <p className="text-sm text-ink-500">Nenhuma categoria ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-100 rounded-lg border border-ink-200 dark:divide-ink-900 dark:border-ink-800">
          {categories.map((c) => (
            <CategoryRow key={`${c.id}-${c.name}`} category={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryRow({ category }: { category: Item }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [name, setName] = useState(category.name);
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const tasks = `${category.taskCount} ${category.taskCount === 1 ? "tarefa" : "tarefas"}`;

  function rename(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await renameCategoryAction(category.id, name);
      setMessage(result.message);
      if (result.category) setEditing(false);
    });
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3 text-sm">
      {editing ? (
        <form onSubmit={rename} className="flex flex-wrap items-center gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="Nome da categoria" className={`${inputClass} max-w-xs`} autoFocus />
          <button type="submit" disabled={pending || !name.trim()} className={secondaryButtonClass}>
            Salvar
          </button>
          <button type="button" onClick={() => { setEditing(false); setName(category.name); setMessage(undefined); }} className={linkButton}>
            Cancelar
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold">{category.name}</span>
          <span className="text-ink-500">{tasks}</span>
          <span className="ml-auto flex gap-3">
            <button type="button" onClick={() => setEditing(true)} className={`${linkButton} text-brand-600`}>
              Renomear
            </button>
            <button type="button" onClick={() => setConfirming(true)} className={`${linkButton} text-pen`}>
              Excluir
            </button>
          </span>
        </div>
      )}
      {confirming && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md bg-amber-50 px-3 py-2 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {category.taskCount > 0
            ? `Excluir "${category.name}"? ${tasks} ${category.taskCount === 1 ? "ficará" : "ficarão"} sem categoria.`
            : `Excluir "${category.name}"?`}
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(async () => setMessage((await deleteCategoryAction(category.id)).message))}
            className={`${linkButton} text-pen`}
          >
            Sim, excluir
          </button>
          <button type="button" onClick={() => setConfirming(false)} className={linkButton}>
            Cancelar
          </button>
        </div>
      )}
      <FormMessage message={message} />
    </li>
  );
}
