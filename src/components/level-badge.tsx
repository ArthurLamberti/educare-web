/** The level's code (e.g. "B1"), with its name on hover. */
export function LevelBadge({ level }: { level: { code: string; name: string } | null }) {
  if (!level) return null;
  return (
    <span
      title={`Nível ${level.code} · ${level.name}`}
      className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-ink-800 dark:text-brand-300"
    >
      {level.code}
    </span>
  );
}
