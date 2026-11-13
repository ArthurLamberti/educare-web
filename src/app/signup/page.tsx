import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/signup-form";
import { ROOT_DOMAIN } from "@/lib/host";
import { timeZoneOptions } from "@/lib/time-zones";

export const metadata: Metadata = { title: "Criar meu espaço" };

const POINTS = [
  "Um endereço só seu, para passar aos alunos",
  "Aulas avulsas ou semanais, tarefas com correção e flashcards por aluno",
  "Você cadastra os alunos; eles entram com e-mail e senha",
];

/** Private teacher sign-up, on the root domain only (the proxy sends school subdomains away). */
export default function SignupPage() {

  return (
    <section className="mx-auto mt-2 grid w-full max-w-4xl overflow-hidden rounded-lg border border-ink-200 bg-white md:grid-cols-[1fr_1.2fr] dark:border-ink-800 dark:bg-ink-900">
      <div className="flex flex-col justify-between gap-10 bg-brand-800 p-8 text-brand-50 md:p-10 dark:bg-brand-900">
        <div className="flex flex-col gap-3">
          <p className="font-display text-3xl leading-tight font-semibold text-white">Para professores particulares</p>
          <p className="text-brand-200">Organize seus alunos sem depender de uma escola.</p>
        </div>
        <ul className="flex flex-col gap-3 text-sm">
          {POINTS.map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden className="text-highlight">
                ✓
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-6 p-8 md:p-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl">Criar meu espaço</h1>
          <p className="text-sm text-ink-500">
            Dá aula numa escola? Peça o endereço dela. <Link href="/" className="font-bold text-brand-600 hover:underline">Voltar ao início</Link>
          </p>
        </div>
        <SignupForm rootDomain={ROOT_DOMAIN} timeZones={timeZoneOptions()} />
      </div>
    </section>
  );
}
