import "server-only";

import { apiFetch } from "./api";
import type { School } from "./auth";

/** School admins and private teachers (the API answers 403 to others). The address never changes. */
export function updateSettings(data: { name: string; timeZone: string }): Promise<School> {
  return apiFetch("/api/tenant", { method: "PUT", body: JSON.stringify(data) });
}
