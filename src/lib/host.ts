/**
 * Subdomain → school mapping, shared by src/proxy.ts and server code.
 * Kept free of `server-only`/`next/headers` so the proxy can import it.
 */

/** Request header set by the proxy with the school slug. */
export const TENANT_HEADER = "x-tenant-slug";

/** Cookie holding the API access token. */
export const SESSION_COOKIE = "educare_session";

/** Cookie holding the platform operator key on the root domain (operator panel, `/admin`). */
export const OPERATOR_COOKIE = "educare_operator";

/** A school's or space's address: 3-40 lowercase letters, digits or hyphens (same rule as the API). */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3000";

/** `demo` for `demo.localhost:3000`; null for the root domain or anything else. */
export function slugFromHost(host: string, rootDomain = ROOT_DOMAIN): string | null {
  const h = host.toLowerCase();
  const root = rootDomain.toLowerCase();
  if (!h.endsWith(`.${root}`)) return null;
  const sub = h.slice(0, -(root.length + 1));
  return SLUG_PATTERN.test(sub) ? sub : null;
}
