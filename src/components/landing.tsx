import { FlashcardDemo } from "@/components/flashcard-demo";
import { SchoolFinder } from "@/components/school-finder";
import { ROOT_DOMAIN } from "@/lib/host";

const ROLES = [
  {
    title: "Professores",
    items: [
      "Agendam aulas individuais no fuso horário da escola",
      "Escrevem uma tarefa uma vez e atribuem a qualquer aluno",
      "Corrigem respostas com nota e comentário escrito",
      "Cadastram as palavras de cada aluno nos flashcards e acompanham o progresso",
    ],
  },
  {
    title: "Alunos",
    items: [
      "Veem as próximas aulas e pedem para remarcar com até 2 dias de antecedência",
      "Respondem tarefas e leem o comentário do professor",
      "Revisam em poucos minutos os cartões do dia",
    ],
  },
  {
    title: "Escolas",
    items: [
      "Têm um endereço próprio, separado de todas as outras escolas",
      "Cadastram os professores, e cada professor cadastra seus alunos",
      "Reúnem aulas, tarefas e pedidos em um só lugar",
    ],
  },
];

/** Root domain page: what Educare is and how to reach your school. */
export function Landing() {
  return (
    <div className="flex flex-col gap-20 py-4">
      <section className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6">
          <h1 className="font-display text-4xl leading-[1.1] font-semibold sm:text-5xl">
            Aulas, lição de casa e flashcards para o ensino individual.
          </h1>
          <p className="max-w-prose text-lg text-ink-600 dark:text-ink-300">
            A Educare dá a cada escola o seu próprio espaço. Professores planejam aulas e corrigem tarefas; alunos sabem
            o que vem a seguir e revisam um pouco do que aprenderam todo dia.
          </p>
          <SchoolFinder rootDomain={ROOT_DOMAIN} />
          <p className="text-sm text-ink-500">Não sabe o endereço? Ele está no convite que sua escola enviou.</p>
        </div>
        <div className="md:-rotate-1">
          <FlashcardDemo />
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-2xl">Toda a escola trabalha no mesmo lugar</h2>
        <div className="grid gap-10 md:grid-cols-3">
          {ROLES.map((role) => (
            <div key={role.title} className="flex flex-col gap-3 border-t-2 border-brand-600 pt-4">
              <h3 className="font-display text-lg font-semibold">{role.title}</h3>
              <ul className="flex flex-col gap-2 text-ink-700 dark:text-ink-300">
                {role.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-200 pt-6 text-sm text-ink-500 dark:border-ink-800">
        Educare. Feita para escolas que ensinam um aluno de cada vez.
      </footer>
    </div>
  );
}
