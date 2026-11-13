import { ROOT_DOMAIN } from "@/lib/host";

export function SchoolNotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-3 text-center">
      <h1 className="text-2xl font-bold">Escola não encontrada</h1>
      <p className="text-ink-600 dark:text-ink-400">
        Não há escola neste endereço. Confira o link que sua escola enviou, no formato{" "}
        <code className="font-mono">sua-escola.{ROOT_DOMAIN}</code>.
      </p>
    </section>
  );
}
