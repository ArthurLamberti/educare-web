/** Words that were not added because the student already had them as flashcards. */
export function SkippedWords({ words }: { words: string[] | undefined }) {
  if (!words?.length) return null;
  const shown = words.slice(0, 10);
  const rest = words.length - shown.length;
  return (
    <p role="status" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      {words.length === 1 ? "1 palavra já estava" : `${words.length} palavras já estavam`} nos flashcards e{" "}
      {words.length === 1 ? "foi ignorada" : "foram ignoradas"}: {shown.join(", ")}
      {rest > 0 && ` e mais ${rest}`}.
    </p>
  );
}
