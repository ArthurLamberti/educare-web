import "server-only";

import { headers } from "next/headers";

import { TENANT_HEADER } from "./host";

/** Slug of the school for this request (set by the proxy from the subdomain), or null on the root domain. */
export async function getTenantSlug(): Promise<string | null> {
  return (await headers()).get(TENANT_HEADER);
}
