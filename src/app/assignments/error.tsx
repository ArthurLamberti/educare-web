"use client";

export default function AssignmentsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <h2 className="text-lg font-semibold">Não foi possível carregar os dados</h2>
      <p className="text-sm text-ink-500">{error.message}</p>
      <button onClick={reset} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500">
        Tentar de novo
      </button>
    </div>
  );
}
