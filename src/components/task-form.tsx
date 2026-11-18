"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  createCategoryAction,
  saveTask,
  type TaskFormState,
} from "@/app/tasks/actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/form-field";
import { Markdown } from "@/components/markdown";
import type { Level } from "@/lib/levels";

type Category = { id: number; name: string };

/**
 * Title, optional level and category, Markdown instructions with a Write/Preview switch, and optional
 * open questions (instructions may be empty when there are questions). `levels`
 * are the active levels (a task whose level was deactivated since keeps it as an extra option);
 * `categories` are the teacher's own, and a new one can be created without leaving the form.
 */
export function TaskForm({
  task,
  levels,
  categories,
}: {
  task?: {
    id: number;
    title: string;
    instructions: string;
    level: Level | null;
    category: Category | null;
    questions: { prompt: string }[];
  };
  levels: Level[];
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<TaskFormState, FormData>(
    saveTask.bind(null, task?.id ?? null),
    {},
  );
  const [instructions, setInstructions] = useState(task?.instructions ?? "");
  const [preview, setPreview] = useState(false);
  const title = state.values?.title ?? task?.title ?? "";
  const levelId =
    state.values?.levelId ?? (task?.level ? String(task.level.id) : "");
  const options =
    task?.level && !levels.some((l) => l.id === task.level?.id)
      ? [...levels, task.level]
      : levels;
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [categoryId, setCategoryId] = useState(
    state.values?.categoryId ??
      (task?.category ? String(task.category.id) : ""),
  );
  const [questionCount, setQuestionCount] = useState(
    task?.questions.length ?? 0,
  );

  const tab = (active: boolean) =>
    `rounded-md px-3 py-1 text-xs font-bold ${active ? "bg-ink-200 dark:bg-ink-700" : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"}`;

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <FormMessage message={state.message} />

      <Field label="Título" error={state.errors?.title}>
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={title}
          key={`t-${title}`}
          className={inputClass}
        />
      </Field>

      <Field label="Nível (opcional)" error={state.errors?.levelId}>
        <select
          name="levelId"
          defaultValue={levelId}
          key={`l-${levelId}`}
          className={`${inputClass} max-w-xs`}
        >
          <option value="">Sem nível</option>
          {options.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} · {l.name}
            </option>
          ))}
        </select>
      </Field>

      <CategoryField
        options={categoryOptions}
        value={categoryId}
        onChange={setCategoryId}
        onCreated={(c) => {
          setCategoryOptions((list) =>
            [...list, c].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
          );
          setCategoryId(String(c.id));
        }}
        error={state.errors?.categoryId}
      />

      <div className="flex flex-col gap-1 text-sm font-bold">
        <div className="flex items-center gap-2">
          <span id="instructions-label">
            Instruções{questionCount > 0 && " (opcional)"}
          </span>
          <span className="ml-auto flex gap-1" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!preview}
              onClick={() => setPreview(false)}
              className={tab(!preview)}
            >
              Escrever
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={preview}
              onClick={() => setPreview(true)}
              className={tab(preview)}
            >
              Visualizar
            </button>
          </span>
        </div>
        {/* The textarea stays mounted (hidden in preview) so its value is always submitted. */}
        <textarea
          name="instructions"
          aria-labelledby="instructions-label"
          required={questionCount === 0}
          maxLength={10000}
          rows={12}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          hidden={preview}
          className={`${inputClass} font-mono`}
        />
        {preview && (
          <div className="min-h-48 rounded-md border border-ink-300 px-3 py-2 font-normal dark:border-ink-700">
            {instructions.trim() ? (
              <Markdown>{instructions}</Markdown>
            ) : (
              <p className="text-ink-500">Nada para visualizar.</p>
            )}
          </div>
        )}
        {state.errors?.instructions && (
          <span className="text-xs font-normal text-red-600">
            {state.errors.instructions}
          </span>
        )}
        <span className="text-xs font-normal text-ink-500">
          Markdown: **negrito**, *itálico*, listas com &quot;- &quot;, links
          [texto](https://…). HTML aparece como texto. {instructions.length}
          /10000
        </span>
      </div>

      <QuestionsField
        initial={
          state.values?.questions ?? task?.questions.map((q) => q.prompt) ?? []
        }
        key={JSON.stringify(state.values?.questions ?? null)}
        onCount={setQuestionCount}
        error={state.errors?.questions}
      />

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <Link
          href={task ? `/tasks/${task.id}` : "/tasks"}
          className="rounded-md px-4 py-2 text-sm font-bold text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

/** The category select, plus "Nova categoria" to create one in place and select it. */
function CategoryField({
  options,
  value,
  onChange,
  onCreated,
  error,
}: {
  options: Category[];
  value: string;
  onChange: (value: string) => void;
  onCreated: (category: Category) => void;
  error?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function create() {
    startTransition(async () => {
      const result = await createCategoryAction(name);
      setMessage(result.message);
      if (result.category) {
        onCreated(result.category);
        setAdding(false);
        setName("");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm font-bold">
      <label htmlFor="categoryId">Categoria (opcional)</label>
      <div className="flex flex-wrap items-center gap-2">
        <select
          id="categoryId"
          name="categoryId"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} max-w-xs`}
        >
          <option value="">Sem categoria</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            + Nova categoria
          </button>
        )}
      </div>
      {adding && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Not a nested form: Enter creates the category instead of saving the task. */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (name.trim()) create();
              }
            }}
            maxLength={60}
            placeholder="Nome da categoria"
            aria-label="Nome da nova categoria"
            className={`${inputClass} max-w-xs font-normal`}
            autoFocus
          />
          <button
            type="button"
            disabled={pending || !name.trim()}
            onClick={create}
            className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-50 dark:hover:bg-ink-900"
          >
            {pending ? "Criando..." : "Criar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setMessage(undefined);
            }}
            className="text-xs font-bold hover:underline"
          >
            Cancelar
          </button>
        </div>
      )}
      {(message ?? error) && (
        <span className="text-xs font-normal text-pen">{message ?? error}</span>
      )}
    </div>
  );
}

const smallButton =
  "rounded px-2 py-1 text-xs font-bold text-ink-600 hover:bg-ink-100 disabled:opacity-30 dark:text-ink-300 dark:hover:bg-ink-800";

/** Open questions, in order: one "question" field each; add, remove and reorder. */
function QuestionsField({
  initial,
  onCount,
  error,
}: {
  initial: string[];
  onCount: (n: number) => void;
  error?: string;
}) {
  const nextKey = useRef(initial.length);
  const [items, setItems] = useState(() =>
    initial.map((prompt, key) => ({ key, prompt })),
  );
  // Focus the field just added, so typing goes into it (not into the button).
  const [focusKey, setFocusKey] = useState<number>();
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusKey !== undefined)
      list.current
        ?.querySelector<HTMLTextAreaElement>(`[data-key="${focusKey}"]`)
        ?.focus();
  }, [focusKey]);

  function change(next: { key: number; prompt: string }[]) {
    setItems(next);
    onCount(next.length);
  }
  function move(i: number, by: number) {
    const next = [...items];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    change(next);
  }

  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend className="mb-1 font-bold">Perguntas (opcional)</legend>
      <p className="text-xs text-ink-500">
        O aluno responde cada pergunta em um campo próprio. Perguntas em branco
        são ignoradas.
      </p>
      <div ref={list} className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={item.key} className="flex items-start gap-2">
            <span className="w-6 pt-2 text-right font-bold text-ink-500">
              {i + 1}.
            </span>
            <textarea
              name="question"
              data-key={item.key}
              aria-label={`Pergunta ${i + 1}`}
              value={item.prompt}
              onChange={(e) =>
                change(
                  items.map((it) =>
                    it.key === item.key
                      ? { ...it, prompt: e.target.value }
                      : it,
                  ),
                )
              }
              maxLength={2000}
              rows={2}
              className={`${inputClass} flex-1`}
            />
            <div className="flex flex-col">
              <button
                type="button"
                aria-label={`Subir pergunta ${i + 1}`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className={smallButton}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Descer pergunta ${i + 1}`}
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
                className={smallButton}
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              aria-label={`Remover pergunta ${i + 1}`}
              onClick={() => change(items.filter((it) => it.key !== item.key))}
              className={`${smallButton} mt-1 text-pen`}
            >
              Remover
            </button>
          </div>
        ))}
      </div>
      {items.length < 50 && (
        <button
          type="button"
          onClick={() => {
            const key = nextKey.current++;
            change([...items, { key, prompt: "" }]);
            setFocusKey(key);
          }}
          className="self-start text-xs font-bold text-brand-600 hover:underline"
        >
          + Adicionar pergunta
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </fieldset>
  );
}
