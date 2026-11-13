# Educare Web

Next.js frontend (App Router, TypeScript, Tailwind) for Educare. Consumes the Spring Boot API in `../educare-api`.

## Running

```bash
# 1. Start the API (port 8080)
cd ../educare-api && ./gradlew bootRun

# 2. Configure and start the frontend (port 3000)
cp .env.example .env.local   # adjust API_URL if needed
npm install
npm run dev
```

Open http://demo.localhost:3000 and log in with `admin@demo.com` / `password123` (school `demo` is
seeded by the API in its `dev` profile). Modern browsers resolve `*.localhost` to your machine, so no
`/etc/hosts` change is needed.

## Schools and sessions

Each school is served on its own subdomain (`<school>.<ROOT_DOMAIN>`); the root domain only shows a
landing page. `src/proxy.ts` takes the school slug from the host and passes it to server code in the
`x-tenant-slug` request header; `apiFetch` sends it to the API as `X-Tenant`.

After login the API token is stored in the httpOnly cookie `educare_session`, valid only on that
school's subdomain. Pages and Server Actions call `requireUser(roles)` (`src/lib/auth.ts`), which is
the real authorization check: it redirects to `/login`, to `/change-password` while the user has a
temporary password, or to `/not-allowed` for other roles. The proxy only does the optimistic redirect
to login when there is no cookie. API 401 ends the session (`/session/expired`).

| Variable | Purpose |
|---|---|
| `API_URL` | educare-api base URL (server only) |
| `ROOT_DOMAIN` | Domain schools are subdomains of, e.g. `educare.com`; `localhost:3000` in development |

## How it talks to the API

API calls happen **only on the Next.js server** (Server Components for reads and Server Actions
for writes). The browser never calls Spring directly, so no CORS configuration is needed in the API
and `API_URL` is never exposed to the client.

```
src/
├── proxy.ts                  # subdomain → school, redirect to login without a session
├── lib/api.ts                # base fetch (X-Tenant, Authorization), ApiError, Page<T> normalization
├── lib/auth.ts               # getCurrentUser / requireUser / getSchool (data access layer)
├── lib/session.ts            # session cookie
├── lib/students.ts           # /api/students API functions
├── lib/teachers.ts           # /api/teachers API functions
├── app/students/actions.ts   # Server Actions: save / remove
├── app/students/...          # pages: list, new, [id]/edit
├── lib/datetime.ts           # school time zone <-> UTC instants (Intl, DST-safe)
├── lib/lessons.ts            # /api/lessons API functions
├── app/lessons/...           # tabs Upcoming/Past/Canceled, new, [id]/edit, [id]/request-change; cancel action
├── lib/reschedule-requests.ts # /api/reschedule-requests API functions, 48h deadline helpers
├── app/requests/...          # students: their requests + withdraw; teachers: inbox with approve/reject
├── lib/tasks.ts, lib/assignments.ts # /api/tasks and /api/assignments API functions
├── app/tasks/...             # teacher task library: list (search, archived), new, [id] (assign, unassign), [id]/edit
├── app/assignments/...       # students: to-do + completed; teachers/admins: overview with filters; [id] detail
├── components/markdown.tsx   # safe Markdown (react-markdown, raw HTML shown as text, no images)
├── app/teachers/...          # admin pages: list, new, [id]/edit
├── app/login, change-password, not-allowed, session/expired
└── components/               # form and delete button (client components)
```

To add a new API resource: create `src/lib/<resource>.ts` using `apiFetch`, the pages in
`src/app/<resource>/` and the corresponding Server Actions. Start every page and Server Action with
`await requireUser([...roles])`.
