import "server-only";

import { apiFetch } from "./api";

/** Public sign-up of private teachers (educare-api `/api/public/**`): no tenant, no session. */

export type SlugAvailability = { slug: string; available: boolean; reason: "INVALID" | "RESERVED" | "TAKEN" | null };

export type SignupData = {
  name: string;
  email: string;
  password: string;
  spaceName: string;
  slug: string;
  timeZone: string;
};

const pub = { auth: false, forwardClientIp: true } as const;

export function checkSlug(slug: string): Promise<SlugAvailability> {
  return apiFetch(`/api/public/slug-availability?${new URLSearchParams({ slug })}`, pub);
}

/** Creates the space and emails the confirmation link. */
export function signUp(data: SignupData): Promise<{ slug: string }> {
  return apiFetch("/api/public/signups", { ...pub, method: "POST", body: JSON.stringify(data) });
}

export function confirmEmail(token: string): Promise<{ slug: string }> {
  return apiFetch("/api/public/signups/confirm", { ...pub, method: "POST", body: JSON.stringify({ token }) });
}

/** Always succeeds (the API never tells whether the account exists). */
export function resendConfirmation(email: string, slug: string): Promise<void> {
  return apiFetch("/api/public/signups/resend", { ...pub, method: "POST", body: JSON.stringify({ email, slug }) });
}
