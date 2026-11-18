"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import {
  addWordsAction,
  deleteWordAction,
  sendWordsAsTaskAction,
  sendWordsToFlashcardsAction,
  type SendWordsState,
  type WordsFormState,
} from "@/app/lessons/actions";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";
import { parseCardLines } from "@/lib/card-lines";
import type { LessonWord } from "@/lib/lessons";

const EXAMPLE = "went;foi\nto look up;procurar\nhouse;casa";

const secondaryButtonClass =
  "rounded-md border border-brand-600 px-4 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-50 dark:hover:bg-ink-900";

/** Read-only list, for the lesson's student and the school's admins. */
export function LessonWordList({ words }: { words: LessonWord[] }) {
  if (words.length === 0) return <p className="text-ink-500">Nenhuma palavra nova nesta aula.</p>;
  return (
    <ul className="flex flex-col divide-y divide-ink-100 rounded-md border border-ink-200 dark:divide-ink-800 dark:border-ink-800">
      {words.map((w) => (
        <li key={w.id} className="flex flex-wrap gap-x-3 px-4 py-2">
          <span className="font-bold">{w.word}</span>
          <span className="text-ink-600 dark:text-ink-400">{w.meaning}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The teacher's list of new words of a lesson: add them ("palavra;tradução" per line), then send the ones
 * not yet sent to the student's flashcards and/or as a task of writing a sentence with each.
 */
export function LessonWords({
  lessonId,
  studentId,
  studentName,
  words,
  timeZone,
}: {
  lessonId: number;
  studentId: number;
  studentName: string;
  words: LessonWord[];
  timeZone: string;
}) {
  const firstName = studentName.split(" ")[0];
  const pendingCards = words.filter((w) => w.flashcardSentAt === null).length;
  const pendingTask = words.filter((w) => w.taskSentAt === null).length;

  return (
    <div className="flex flex-col gap-4">
      {words.length > 0 && <WordTable words={words} />}
      <AddWordsForm lessonId={lessonId} />
      {words.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SendToFlashcards lessonId={lessonId} studentId={studentId} firstName={firstName} pending={pendingCards} />
          <SendAsTask lessonId={lessonId} firstName={firstName} pending={pendingTask} timeZone={timeZone} />
        </div>
      )}
    </div>
  );
}

function WordTable({ words }: { words: LessonWord[] }) {
  return (
    <ul className="flex flex-col divide-y divide-ink-100 rounded-md border border-ink-200 dark:divide-ink-800 dark:border-ink-800">
      {words.map((w) => (
        <WordRow key={w.id} word={w} />
      ))}
    </ul>
  );
}

function WordRow({ word }: { word: LessonWord }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2">
      <span className="font-bold">{word.word}</span>
      <span className="text-ink-600 dark:text-ink-400">{word.meaning}</span>
      <span className="ml-auto flex items-center gap-2 text-xs">
        {word.flashcardSentAt && <Badge>Nos flashcards</Badge>}
        {word.taskSentAt && <Badge>Na tarefa</Badge>}
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => setMessage((await deleteWordAction(word.id)).message))}
          aria-label={`Remover ${word.word}`}
          className="font-bold text-red-600 hover:underline disabled:opacity-50"
        >
          {pending ? "Removendo..." : "Remover"}
        </button>
      </span>
      {message && <span className="w-full text-xs text-pen">{message}</span>}
    </li>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-green-50 px-2 py-0.5 font-bold text-green-800 dark:bg-green-950 dark:text-green-300">{children}</span>;
}

function AddWordsForm({ lessonId }: { lessonId: number }) {
  const [state, formAction, pending] = useActionState<WordsFormState, FormData>(addWordsAction.bind(null, lessonId), {});
  // Remount after each success: empty after saving, the typed text kept after an error.
  return <AddWordsFields key={state.done ?? 0} state={state} formAction={formAction} pending={pending} />;
}

function AddWordsFields({ state, formAction, pending }: { state: WordsFormState; formAction: (data: FormData) => void; pending: boolean }) {
  const [text, setText] = useState(state.text ?? "");
  const parsed = parseCardLines(text);
  const count = parsed.cards.length;
  const ready = count > 0 && parsed.errors.length === 0;
  const errors = text === state.text && state.errors?.length ? state.errors : parsed.errors;

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-lg bg-ink-50 p-3 dark:bg-ink-900">
      <h3 className="text-sm font-semibold">Adicionar palavras</h3>
      <p className="text-xs text-ink-500">
        Uma por linha, no formato <code className="font-mono">palavra;tradução</code>.
      </p>
      {state.added !== undefined && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          {state.added} {state.added === 1 ? "palavra adicionada" : "palavras adicionadas"}.
        </p>
      )}
      <FormMessage message={state.message} />
      <textarea
        name="lines"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={EXAMPLE}
        aria-label="Palavras novas, uma por linha no formato palavra;tradução"
        aria-describedby="word-errors"
        className={`${inputClass} font-mono`}
      />
      {errors.length > 0 && (
        <ul id="word-errors" className="flex flex-col gap-0.5 text-xs text-pen">
          {errors.slice(0, 10).map((e) => (
            <li key={e}>{e}</li>
          ))}
          {errors.length > 10 && <li>e mais {errors.length - 10} {errors.length - 10 === 1 ? "problema" : "problemas"}.</li>}
        </ul>
      )}
      <div>
        <button type="submit" disabled={pending || !ready} className={primaryButtonClass}>
          {pending ? "Adicionando..." : count > 0 ? `Adicionar ${count} ${count === 1 ? "palavra" : "palavras"}` : "Adicionar palavras"}
        </button>
      </div>
    </form>
  );
}

function plural(n: number) {
  return `${n} ${n === 1 ? "palavra" : "palavras"}`;
}

function SendToFlashcards({ lessonId, studentId, firstName, pending }: { lessonId: number; studentId: number; firstName: string; pending: number }) {
  const [state, action, sending] = useActionState<SendWordsState, FormData>(sendWordsToFlashcardsAction.bind(null, lessonId), {});
  return (
    <form action={action} className="flex flex-col gap-2 rounded-md border border-ink-200 p-3 dark:border-ink-800">
      <h3 className="text-sm font-semibold">Flashcards</h3>
      <p className="text-xs text-ink-500">Cada palavra vira um cartão (palavra na frente, tradução no verso) para {firstName} revisar.</p>
      {state.sent !== undefined && (
        <p role="status" className="text-sm text-green-800 dark:text-green-300">
          {plural(state.sent)} {state.sent === 1 ? "enviada" : "enviadas"}.{" "}
          <Link href={`/students/${studentId}/flashcards`} className="font-bold underline">
            Ver flashcards
          </Link>
        </p>
      )}
      <FormMessage message={state.message} />
      <div>
        {pending > 0 ? (
          <button type="submit" disabled={sending} className={secondaryButtonClass}>
            {sending ? "Enviando..." : `Enviar ${plural(pending)} para os flashcards`}
          </button>
        ) : (
          <span className="text-sm text-ink-500">Todas as palavras já estão nos flashcards.</span>
        )}
      </div>
    </form>
  );
}

function SendAsTask({ lessonId, firstName, pending, timeZone }: { lessonId: number; firstName: string; pending: number; timeZone: string }) {
  const [state, action, sending] = useActionState<SendWordsState, FormData>(sendWordsAsTaskAction.bind(null, lessonId), {});
  return (
    <form action={action} className="flex flex-col gap-2 rounded-md border border-ink-200 p-3 dark:border-ink-800">
      <h3 className="text-sm font-semibold">Tarefa de frases</h3>
      <p className="text-xs text-ink-500">{firstName} recebe uma tarefa para escrever uma frase com cada palavra nova.</p>
      {state.taskId !== undefined && (
        <p role="status" className="text-sm text-green-800 dark:text-green-300">
          Tarefa enviada.{" "}
          <Link href={`/tasks/${state.taskId}`} className="font-bold underline">
            Ver tarefa
          </Link>
        </p>
      )}
      <FormMessage message={state.message} />
      {pending > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Entrega (opcional)" error={state.dueError}>
              <input name="date" type="date" className={inputClass} />
            </Field>
            <Field label="Horário">
              <input name="time" type="time" step={300} defaultValue="23:59" className={inputClass} />
            </Field>
          </div>
          <span className="text-xs text-ink-500">Horário da escola ({timeZone.replaceAll("_", " ")}).</span>
          <div>
            <button type="submit" disabled={sending} className={secondaryButtonClass}>
              {sending ? "Enviando..." : `Enviar tarefa com ${plural(pending)}`}
            </button>
          </div>
        </>
      ) : (
        <span className="text-sm text-ink-500">Todas as palavras já foram enviadas em uma tarefa.</span>
      )}
    </form>
  );
}
