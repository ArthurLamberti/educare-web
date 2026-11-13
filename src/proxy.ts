import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, slugFromHost, TENANT_HEADER } from "./lib/host";

/** Pages reachable without a session on a school subdomain. */
const PUBLIC_PATHS = ["/login", "/session/expired"];

/**
 * Routes each request to its school by subdomain and does the optimistic login redirect.
 * Real authorization happens in src/lib/auth.ts (requireUser), close to the data.
 */
export function proxy(request: NextRequest) {
  // Prefer x-forwarded-host: Next.js renders a Server Action's redirect target with an internal
  // fetch to its own origin (Host: localhost), forwarding the original host in this header.
  // It is also what reverse proxies set. Choosing the school this way is not a security boundary:
  // the session cookie is host-only and the API rejects tokens of another school.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const slug = slugFromHost(host);
  const { pathname, search } = request.nextUrl;
  const origin = `${request.nextUrl.protocol}//${host}`;

  // Never trust a tenant header sent by the client.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(TENANT_HEADER);

  if (!slug) {
    // Root domain: only the landing page exists.
    if (pathname !== "/") return NextResponse.redirect(new URL("/", origin));
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  requestHeaders.set(TENANT_HEADER, slug);

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isPublic && !request.cookies.has(SESSION_COOKIE)) {
    const login = new URL("/login", origin);
    if (pathname !== "/") login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
