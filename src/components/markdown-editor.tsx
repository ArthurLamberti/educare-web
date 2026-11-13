"use client";

import { useEffect, useState } from "react";

import { inputClass } from "@/components/form-field";
import { Markdown } from "@/components/markdown";

/**
 * Markdown textarea with a Write/Preview switch. The textarea stays mounted (hidden in preview) so its
 * value is always submitted. With `warnUnsaved`, leaving the page with changes asks for confirmation.
 */
export function MarkdownEditor({
  name,
  label,
  initial,
  maxLength,
  rows = 10,
  warnUnsaved = false,
  error,
  onChange,
}: {
  name: string;
  label: string;
  initial: string;
  maxLength: number;
  rows?: number;
  warnUnsaved?: boolean;
  error?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [preview, setPreview] = useState(false);
  const dirty = value !== initial;

  useEffect(() => {
    if (!warnUnsaved || !dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [warnUnsaved, dirty]);

  const tab = (active: boolean) =>
    `rounded-md px-3 py-1 text-xs font-medium ${active ? "bg-zinc-200 dark:bg-zinc-700" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`;

  return (
    <div className="flex flex-col gap-1 text-sm font-medium">
      <div className="flex items-center gap-2">
        <span id={`${name}-label`}>{label}</span>
        {warnUnsaved && dirty && <span className="text-xs font-normal text-amber-600">Unsaved changes</span>}
        <span className="ml-auto flex gap-1" role="tablist">
          <button type="button" role="tab" aria-selected={!preview} onClick={() => setPreview(false)} className={tab(!preview)}>
            Write
          </button>
          <button type="button" role="tab" aria-selected={preview} onClick={() => setPreview(true)} className={tab(preview)}>
            Preview
          </button>
        </span>
      </div>
      <textarea
        name={name}
        aria-labelledby={`${name}-label`}
        required
        maxLength={maxLength}
        rows={rows}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
        hidden={preview}
        className={`${inputClass} font-mono`}
      />
      {preview && (
        <div className="min-h-32 rounded-md border border-zinc-300 px-3 py-2 font-normal dark:border-zinc-700">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-zinc-500">Nothing to preview.</p>}
        </div>
      )}
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
      <span className="text-xs font-normal text-zinc-500">
        Markdown: **bold**, *italic*, lists with &quot;- &quot;. HTML is shown as text. {value.length}/{maxLength}
      </span>
    </div>
  );
}
