"use client";

export default function LessonsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <h2 className="text-lg font-semibold">Could not load the data</h2>
      <p className="text-sm text-zinc-500">{error.message}</p>
      <button onClick={reset} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
        Try again
      </button>
    </div>
  );
}
