"use client";

import { useSyncExternalStore } from "react";

import { inputClass } from "@/components/form-field";
import type { TimeZoneOptions } from "@/lib/time-zones";

const noop = () => () => {};

/** The browser's zone (null while rendering on the server). */
export function useBrowserTimeZone() {
  return useSyncExternalStore(
    noop,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => null,
  );
}

export function TimeZoneSelect({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (zone: string) => void;
  options: TimeZoneOptions;
}) {
  const known = options.brazil.some(([id]) => id === value) || options.others.includes(value);
  return (
    <select name={name} required value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      {!known && <option value={value}>{value.replaceAll("_", " ")}</option>}
      <optgroup label="Brasil">
        {options.brazil.map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </optgroup>
      <optgroup label="Outros fusos">
        {options.others.map((id) => (
          <option key={id} value={id}>
            {id.replaceAll("_", " ")}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
