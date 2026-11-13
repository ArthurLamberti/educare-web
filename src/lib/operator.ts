import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { apiFetch, ApiError } from "./api";
import type { TenantKind, TenantStatus } from "./auth";
import { OPERATOR_COOKIE } from "./host";

/**
 * Operator panel calls (educare-api `/api/platform/**`) as a platform admin. The admin's token is
 * kept in an httpOnly cookie on the root domain, limited to `/admin`.
 */

export type PlatformTenant = {
  id: number;
  slug: string;
  name: string;
  kind: TenantKind;
  status: TenantStatus;
  timeZone: string;
  createdAt: string;
  statusChangedAt: string;
  owner: { name: string; email: string; emailConfirmed: boolean } | null;
};

export type PlatformAdmin = { id: number; name: string; email: string };

type LoginResponse = { token: string; expiresAt: string; admin: PlatformAdmin };

async function platformFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await cookies()).get(OPERATOR_COOKIE)?.value;
  if (!token) redirect("/admin/login");
  try {
    return await apiFetch<T>(path, { ...init, auth: false, headers: { Authorization: `Bearer ${token}` } });
  } catch (error) {
    // Expired token or deactivated admin: log in again.
    if (error instanceof ApiError && error.status === 401) redirect("/admin/login?expired=1");
    throw error;
  }
}

export function getOperator(): Promise<PlatformAdmin> {
  return platformFetch("/api/platform/auth/me");
}

export function listTenants(status?: TenantStatus): Promise<PlatformTenant[]> {
  return platformFetch(`/api/platform/tenants${status ? `?status=${status}` : ""}`);
}

export function activateTenant(id: number): Promise<PlatformTenant> {
  return platformFetch(`/api/platform/tenants/${id}/activate`, { method: "POST" });
}

export function suspendTenant(id: number): Promise<PlatformTenant> {
  return platformFetch(`/api/platform/tenants/${id}/suspend`, { method: "POST" });
}

/** Logs the admin in and keeps the token in the cookie. Only from Server Actions. */
export async function startOperatorSession(email: string, password: string) {
  const result = await apiFetch<LoginResponse>("/api/platform/auth/login", {
    auth: false,
    forwardClientIp: true,
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  (await cookies()).set(OPERATOR_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    expires: new Date(result.expiresAt),
  });
}

export async function endOperatorSession() {
  (await cookies()).delete({ name: OPERATOR_COOKIE, path: "/admin" });
}
