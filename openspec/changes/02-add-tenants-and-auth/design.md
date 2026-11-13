# Design

## Context

Next.js 16 with `cacheComponents` and `partialPrefetching`. `middleware.ts` is now `proxy.ts` (Node.js runtime). Reading `cookies()`/`headers()` must happen behind `<Suspense>` or in `use cache: private`. All API calls run on the server (`src/lib/api.ts`). The API (change 02) expects `X-Tenant` and `Authorization: Bearer`, returns 401/403/404 as ProblemDetail, and `GET /api/auth/me` returns user + tenant.

## Goals / Non-Goals

**Goals:** one deployment serving all schools by subdomain; token never reaches the browser's JS; defense in depth (proxy for redirects, data access layer for real checks).
**Non-Goals:** custom domains per school, "remember me", password reset by e-mail, platform admin UI.

## Decisions

### Tenant resolution in `proxy.ts`
The proxy reads `Host`, strips `ROOT_DOMAIN`, and:
- root domain → only `/` (landing) is served; other paths redirect to `/`.
- subdomain → sets request header `x-tenant-slug` for downstream code (overwriting any client-sent value to prevent spoofing).
`src/lib/tenant.ts#getTenantSlug()` reads that header via `headers()`. Routes stay flat (`/students`, not `/[tenant]/students`): rewriting to a `[tenant]` segment was considered (the Platforms starter approach) but adds a dynamic segment to every route while the slug is only needed for API calls.
Locally, `*.localhost` resolves to 127.0.0.1 in modern browsers, so `demo.localhost:3000` works without editing `/etc/hosts`.

### Session = API JWT in a host-only cookie
Cookie `educare_session` holds the JWT as issued by the API: httpOnly, `SameSite=Lax`, `Secure` when `NODE_ENV=production`, `Path=/`, no `Domain` attribute (host-only, so it never leaks to other subdomains), `Max-Age` from `expiresAt`. No extra encryption: the token is already signed and is never readable by client JS. Alternative: iron-session wrapping a server-side session - adds a secret and a store without benefit here.

### Optimistic checks in proxy, real checks in the DAL
- Proxy: if there is no cookie and the path is not `/login`, redirect to `/login?next=...`. It does not call the API (runs on every request, including prefetches).
- `src/lib/auth.ts#getCurrentUser()` (`use cache: private`) calls `GET /api/auth/me`; on 401 it redirects to `/logout-expired` route handler that clears the cookie and redirects to `/login`. Pages and Server Actions call `requireUser(roles?)`, which also enforces `mustChangePassword` (redirect to `/change-password`) and role (renders `forbidden()` / a "not allowed" page).
- Session-dependent UI (header user menu, nav) is rendered inside `<Suspense>` so the static shell stays prerenderable.

### `apiFetch` changes
Adds `X-Tenant` from `getTenantSlug()` and `Authorization` from the cookie. Login and provisioning-free calls pass `{ auth: false }`. 401 → `ApiError` handled by the DAL (clear + redirect); 403 → `forbidden()`; tenant 404 on `/api/auth/*` → "School not found" page.
Cookies can only be modified in Server Actions and Route Handlers, so clearing on 401 during render goes through a small Route Handler (`/session/expired`).

### Safe redirects
`next` is accepted only when it starts with `/` and not `//`.

### Teacher pages
Same structure as student pages (`src/lib/teachers.ts`, `src/app/teachers/**`, form + action pattern with `useActionState`).

## Risks / Trade-offs

- [`authInterrupts`/`forbidden()` may require an experimental flag in this Next version] → Check `node_modules/next/dist/docs` before implementing; fall back to rendering a "not allowed" component.
- [Proxy is not a security boundary] → All data access goes through `requireUser`; Server Actions re-check (documented pattern in Next docs).
- [Cookie set on `localhost` subdomains in some browsers] → Host-only cookies work on `demo.localhost`; verify in Chrome and Firefox during implementation.
