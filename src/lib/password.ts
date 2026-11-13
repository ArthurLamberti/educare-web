import "server-only";

import { apiFetch } from "./api";

/**
 * "Forgot password" (educare-api): `user` for people of the current school or space (sent with its
 * `X-Tenant`), `admin` for platform admins on the root domain. Asking always succeeds.
 */
export type PasswordScope = "user" | "admin";

const base = (scope: PasswordScope) => (scope === "admin" ? "/api/platform/auth" : "/api/auth");
const pub = { auth: false, forwardClientIp: true, method: "POST" } as const;

export function requestPasswordReset(scope: PasswordScope, email: string): Promise<void> {
  return apiFetch(`${base(scope)}/forgot-password`, { ...pub, body: JSON.stringify({ email }) });
}

export function resetPassword(scope: PasswordScope, token: string, newPassword: string): Promise<void> {
  return apiFetch(`${base(scope)}/reset-password`, { ...pub, body: JSON.stringify({ token, newPassword }) });
}
