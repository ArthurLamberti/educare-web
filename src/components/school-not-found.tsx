import { ROOT_DOMAIN } from "@/lib/host";

export function SchoolNotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-3 text-center">
      <h1 className="text-2xl font-bold">Endereço não encontrado</h1>
      <p className="text-ink-600 dark:text-ink-400">
        Não há escola nem espaço de professor neste endereço. Confira o link que você recebeu, no formato{" "}
        <code className="font-mono">endereco.{ROOT_DOMAIN}</code>.
      </p>
    </section>
  );
}
