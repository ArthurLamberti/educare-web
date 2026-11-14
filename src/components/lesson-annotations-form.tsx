"use client";

import { useActionState } from "react";

import { saveAnnotations, type AnnotationsState } from "@/app/lessons/actions";
import { FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";

/** The teacher's free-text notes about a lesson; the student reads them on the same page. */
export function LessonAnnotationsForm({ lessonId, text, timeZone }: { lessonId: number; text: string; timeZone: string }) {
  const [state, action, pending] = useActionState<AnnotationsState, FormData>(saveAnnotations.bind(null, lessonId), {});
  const savedAt =
    state.savedAt && new Intl.DateTimeFormat("pt-BR", { timeZone, dateStyle: "short", timeStyle: "short" }).format(new Date(state.savedAt));

  return (
    <form action={action} className="flex flex-col gap-3">
      <FormMessage message={state.message} />
      <textarea
        name="annotations"
        aria-label="Anotações da aula"
        rows={8}
        maxLength={10000}
        defaultValue={state.text ?? text}
        key={state.savedAt ?? "initial"}
        placeholder="O que foi visto, dificuldades, o que estudar até a próxima aula..."
        className={inputClass}
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando..." : "Salvar anotações"}
        </button>
        {savedAt && !pending && <span className="text-sm text-ink-500">Salvo em {savedAt}. O aluno já pode ver.</span>}
      </div>
    </form>
  );
}
