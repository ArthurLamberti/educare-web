/** The task's questions, numbered (task detail and the student's view before answering). */
export function QuestionList({ prompts }: { prompts: string[] }) {
  if (prompts.length === 0) return null;
  return (
    <ol className="flex list-decimal flex-col gap-2 pl-6 text-sm">
      {prompts.map((p, i) => (
        <li key={i} className="whitespace-pre-wrap">
          {p}
        </li>
      ))}
    </ol>
  );
}

/** Each question as the student saw it, with their answer. */
export function QuestionAnswers({ answers }: { answers: { prompt: string; answer: string }[] }) {
  if (answers.length === 0) return null;
  return (
    <ol className="flex flex-col gap-3">
      {answers.map((a, i) => (
        <li key={i} className="flex flex-col gap-1 rounded-lg border border-ink-200 p-4 dark:border-ink-800">
          <span className="text-sm font-bold whitespace-pre-wrap">
            {i + 1}. {a.prompt}
          </span>
          <span className="text-sm whitespace-pre-wrap">{a.answer}</span>
        </li>
      ))}
    </ol>
  );
}
