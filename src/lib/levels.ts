import "server-only";

import { apiFetch } from "./api";

/** A step of the level scale (CEFR A1 to C2 today); the scale comes from the API, never hard-coded. */
export type Level = { id: number; code: string; name: string };

/** The active levels in scale order. */
export function getLevels(): Promise<Level[]> {
  return apiFetch("/api/levels");
}
