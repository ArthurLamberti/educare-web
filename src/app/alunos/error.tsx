"use client";

export default function AlunosError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <h2 className="text-lg font-semibold">Não foi possível carregar os dados</h2>
      <p className="text-sm text-zinc-500">{error.message}</p>
      <button onClick={reset} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
        Tentar novamente
      </button>
    </div>
  );
}
