import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnswerForm } from "@/components/answer-form";
import { AssignmentStatusBadge } from "@/components/assignment-status";
import { Markdown } from "@/components/markdown";
import { QuestionAnswers, QuestionList } from "@/components/question-answers";
import { ApiError } from "@/lib/api";
import { formatScore, getAssignment } from "@/lib/assignments";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";

export const metadata: Metadata = { title: "Atividade" };

const box = "rounded-lg border border-ink-200 p-4 dark:border-ink-800";

/**
 * Students answer here (until graded) and read their grade. Teachers and admins read the answer;
 * teachers go to the grading page from here.
 */
export default async function AssignmentPage({ params }: PageProps<"/assignments/[id]">) {
  const user = await requireUser();
  const zone = user.tenant.timeZone;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const a = await getAssignment(id).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  const isStudent = user.role === "STUDENT";
  const { submission, grade } = a;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/assignments" className="text-sm text-ink-500 hover:underline">← Atividades</Link>
        <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold">
          {a.taskTitle}
          <AssignmentStatusBadge assignment={a} />
        </h1>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
        <dt className="text-ink-500">Prazo</dt>
        <dd className={a.overdue ? "font-bold text-red-700 dark:text-red-400" : ""}>{a.dueAt ? formatDateTime(a.dueAt, zone) : "Sem prazo"}</dd>
        <dt className="text-ink-500">Atribuída em</dt>
        <dd>{formatDateTime(a.assignedAt, zone)}</dd>
        {submission && (
          <>
            <dt className="text-ink-500">Entregue em</dt>
            <dd>
              {formatDateTime(submission.submittedAt, zone)}
              {submission.updatedAt !== submission.submittedAt && (
                <span className="text-ink-500"> · última alteração em {formatDateTime(submission.updatedAt, zone)}</span>
              )}
            </dd>
          </>
        )}
        {!isStudent && (
          <>
            <dt className="text-ink-500">Aluno</dt>
            <dd>{a.studentName}</dd>
          </>
        )}
        {user.role !== "TEACHER" && (
          <>
            <dt className="text-ink-500">Professor</dt>
            <dd>{a.teacherName}</dd>
          </>
        )}
      </dl>

      {user.role === "TEACHER" && (
        <div className="flex gap-3 text-sm">
          {submission && (
            <Link href={`/grading/${a.id}`} className="rounded-md bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-500">
              {grade ? "Revisar nota" : "Corrigir"}
            </Link>
          )}
          <Link href={`/tasks/${a.taskId}`} className="rounded-md px-4 py-2 font-bold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950">
            Abrir tarefa
          </Link>
        </div>
      )}

      {grade && (
        <div className="flex flex-col gap-2 rounded-lg border border-green-300 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <h2 className="flex items-baseline gap-3 text-lg font-semibold">
            Nota <span className="text-2xl">{formatScore(grade.score)}</span>
          </h2>
          <Markdown>{grade.feedback}</Markdown>
          <span className="text-xs text-ink-500">
            {grade.gradedByName && `${grade.gradedByName}, `}
            {formatDateTime(grade.gradedAt, zone)}
          </span>
        </div>
      )}

      {/* Once submitted, show the instructions as they were when answered. */}
      {(submission?.instructionsSnapshot ?? a.instructions).trim() && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Instruções</h2>
          <div className={box}>
            <Markdown>{submission?.instructionsSnapshot ?? a.instructions}</Markdown>
          </div>
        </div>
      )}
      {/* The student answers the questions in the form below; others see them here until answered. */}
      {!submission && !isStudent && a.questions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Perguntas</h2>
          <QuestionList prompts={a.questions.map((q) => q.prompt)} />
        </div>
      )}

      {isStudent && a.status !== "GRADED" ? (
        <>
          {/* While a draft differs from the sent answer, show what the teacher sees. */}
          {submission &&
            a.draft &&
            (a.draft.answer !== submission.answer || a.draft.answers.some((d, i) => d !== submission.answers[i]?.answer)) && (
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Resposta enviada</h2>
                <p className="text-sm text-ink-500">É o que seu professor vê agora.</p>
                <QuestionAnswers answers={submission.answers} />
                {submission.answer.trim() && (
                  <div className={box}>
                    <Markdown>{submission.answer}</Markdown>
                  </div>
                )}
              </div>
            )}
          <AnswerForm
            id={a.id}
            // After the first submission the student answers the questions copied then.
            questions={submission ? submission.answers.map((x) => x.prompt) : a.questions.map((q) => q.prompt)}
            answers={a.draft?.answers.length ? a.draft.answers : (submission?.answers.map((x) => x.answer) ?? [])}
            answer={a.draft?.answer ?? submission?.answer ?? ""}
            submitted={submission !== null}
            draftSavedAt={a.draft ? formatDateTime(a.draft.savedAt, zone) : undefined}
          />
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{isStudent ? "Sua resposta" : "Resposta"}</h2>
          {!submission ? (
            <div className={box}>
              <p className="text-sm text-ink-500">Ainda não entregue.</p>
            </div>
          ) : (
            <>
              <QuestionAnswers answers={submission.answers} />
              {(submission.answer.trim() || submission.answers.length === 0) && (
                <div className={box}>
                  <Markdown>{submission.answer}</Markdown>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
