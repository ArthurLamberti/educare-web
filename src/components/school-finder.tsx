"use client";

import { useState } from "react";

const SLUG = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

/** Takes a school address ("demo") and opens its login page on the school's subdomain. */
export function SchoolFinder({ rootDomain }: { rootDomain: string }) {
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string>();

  function open(e: React.FormEvent) {
    e.preventDefault();
    const value = slug.trim().toLowerCase();
    if (!SLUG.test(value)) {
      setError("Use as letras, números e hifens do endereço da sua escola, por exemplo: demo.");
      return;
    }
    // Another subdomain (another origin), so a full navigation is required.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${window.location.protocol}//${value}.${rootDomain}/login`);
  }

  return (
    <form onSubmit={open} noValidate className="flex w-full max-w-md flex-col gap-2">
      <label htmlFor="school" className="text-sm font-bold">
        Endereço da sua escola
      </label>
      <div className="flex rounded-md border border-ink-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 dark:border-ink-700 dark:bg-ink-900">
        <input
          id="school"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setError(undefined);
          }}
          placeholder="sua-escola"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "school-error" : undefined}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-right outline-none"
        />
        <span className="self-center pr-3 text-ink-500">.{rootDomain}</span>
      </div>
      {error && (
        <p id="school-error" className="text-sm text-pen">
          {error}
        </p>
      )}
      <button type="submit" className="mt-1 self-start rounded-md bg-brand-600 px-5 py-2.5 font-bold text-white hover:bg-brand-500">
        Ir para minha escola
      </button>
    </form>
  );
}
