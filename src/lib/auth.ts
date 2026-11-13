import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { apiFetch, ApiError } from "./api";
import { getSessionToken } from "./session";
import { getTenantSlug } from "./tenant";

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

/** `INDIVIDUAL`: a private teacher's own space (no admin, one teacher). */
export type TenantKind = "SCHOOL" | "INDIVIDUAL";

/**
 * `PENDING`: a new private space waiting to be activated (by the operator; later by a payment).
 * `SUSPENDED`: turned off. Users of a space that is not `ACTIVE` only see `/pending`.
 */
export type TenantStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export type School = { slug: string; name: string; timeZone: string; kind: TenantKind; status: TenantStatus };

/** How to call the place in texts: "escola" for schools, "espaço" for a private teacher. */
export function placeWord(kind: TenantKind) {
  return kind === "INDIVIDUAL" ? "espaço" : "escola";
}

/** School admins and private teachers manage the name and time zone. */
export function canEditSettings(user: User) {
  return user.role === "ADMIN" || (user.role === "TEACHER" && user.tenant.kind === "INDIVIDUAL");
}

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  tenant: School;
};

/**
 * Data access layer for the session. Every page and Server Action that needs a user goes through
 * `requireUser`, which is the real authorization check (the proxy only does optimistic redirects).
 */

/** The logged-in user, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!(await getTenantSlug()) || !(await getSessionToken())) return null;
  return apiFetch<User>("/api/auth/me");
});

type RequireOptions = {
  /** Let users with a temporary password through (only the change-password page). */
  allowPasswordChange?: boolean;
  /** Let users of a space that is not active through (only the pending page). */
  allowInactive?: boolean;
};

export async function requireUser(roles?: Role[], { allowPasswordChange = false, allowInactive = false }: RequireOptions = {}): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.tenant.status !== "ACTIVE" && !allowInactive) redirect("/pending");
  if (user.mustChangePassword && !allowPasswordChange) redirect("/change-password");
  if (roles && !roles.includes(user.role)) redirect("/not-allowed");
  return user;
}

/** The school of this subdomain, or null when it does not exist. Public (no login needed). */
export const getSchool = cache(async (): Promise<School | null> => {
  if (!(await getTenantSlug())) return null;
  try {
    return await apiFetch<School>("/api/tenant", { auth: false });
  } catch (error) {
    if (error instanceof ApiError && error.isUnknownSchool) return null;
    throw error;
  }
});
