import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE } from "./host";

/*
 * The session is the API access token, kept in an httpOnly cookie that client JavaScript cannot
 * read. It has no Domain attribute, so it only exists on the school subdomain that set it.
 */

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Only callable from Server Actions and Route Handlers. */
export async function setSessionToken(token: string, expiresAt: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

/** Only callable from Server Actions and Route Handlers. */
export async function clearSessionToken() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Accepts only same-site paths, to prevent open redirects through `?next=`. */
export function safeNextPath(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : "/";
}
