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

## Schools, private teachers and sessions

Each school, and each private teacher's space, is served on its own subdomain (`<slug>.<ROOT_DOMAIN>`).
The root domain only has the landing page and the private teacher sign-up (`/signup`). `src/proxy.ts` takes the school slug from the host and passes it to server code in the
`x-tenant-slug` request header; `apiFetch` sends it to the API as `X-Tenant`.

After login the API token is stored in the httpOnly cookie `educare_session`, valid only on that
school's subdomain. Pages and Server Actions call `requireUser(roles)` (`src/lib/auth.ts`), which is
the real authorization check: it redirects to `/login`, to `/change-password` while the user has a
temporary password, or to `/not-allowed` for other roles. The proxy only does the optimistic redirect
to login when there is no cookie. API 401 ends the session (`/session/expired`).

### Private teacher sign-up

1. `localhost:3000/signup` (root domain): name, email, password, space name, address (checked while
   typing) and time zone (defaults to the browser's). The API creates the space and emails a link.
2. In development the email lands in Mailpit: http://localhost:8026 (started by the API's `compose.yaml`).
3. The link opens `<slug>.localhost:3000/confirm?token=…`, which confirms only when "Confirmar meu e-mail"
   is pressed (link scanners cannot use the token up), then sends to `/login?confirmed=1`.
4. Logging in before confirming shows a "Reenviar link" option. "Usei o e-mail errado" on the
   check-email screen lets the teacher fix the email and send again with the same password.

5. After confirming, the teacher can log in but the space is `PENDING`: every page leads to `/pending`
   ("Quase lá") until the operator activates it (later: a payment). A suspended space shows the same
   page with a "suspenso" text.

### Operator panel

`localhost:3000/admin` (root domain only): platform admins log in with email and password. The API
creates the system admin at startup (`EDUCARE_ADMIN_EMAIL`); the first password is set with "Esqueci a
senha (ou primeiro acesso)" (email in Mailpit in development). The admin's token stays in an httpOnly
cookie limited to `/admin`. Tabs Aguardando liberação / Ativos / Suspensos, with "Liberar",
"Suspender" and "Reativar".

### Forgot password

"Esqueci a senha" on every login page: `/forgot-password` → email with a link →
`/reset-password?token=…` → `/login?reset=1`. The operator panel has the same pages under `/admin/`.

Public sign-up calls forward the browser's IP (`X-Forwarded-For`, last hop of the incoming header) so
the API can rate-limit per visitor; in production the reverse proxy in front of Next.js must set that
header, overwriting what clients send.

School admins and private teachers change the name and time zone at `/settings` ("Configurações" in
the user menu).

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
├── proxy.ts                  # subdomain → school, redirect to login without a session; root: /, /signup, /admin
├── lib/signup.ts             # /api/public/** (address check, sign-up, confirm, resend)
├── app/signup/...            # private teacher sign-up (root domain), check-email + resend
├── app/confirm/...           # email confirmation (button, then /login?confirmed=1)
├── app/settings/...          # name and time zone (school admins, private teachers)
├── app/pending/...           # shown while the space is PENDING or SUSPENDED
├── lib/operator.ts           # /api/platform/** with the platform admin's token cookie
├── app/admin/...             # operator panel (root domain): admin login, forgot password, activate/suspend spaces
├── lib/password.ts           # forgot/reset password (school users and platform admins)
├── app/forgot-password, app/reset-password # "Esqueci a senha" on school subdomains
├── components/time-zone-select.tsx # Brazilian zones first; list computed on the server
├── lib/api.ts                # base fetch (X-Tenant, Authorization), ApiError, Page<T> normalization
├── lib/auth.ts               # getCurrentUser / requireUser / getSchool (data access layer)
├── lib/session.ts            # session cookie
├── lib/students.ts           # /api/students API functions
├── lib/teachers.ts           # /api/teachers API functions
├── app/students/actions.ts   # Server Actions: save / remove
├── app/students/...          # pages: list, new, [id]/edit
├── lib/datetime.ts           # school time zone <-> UTC instants (Intl, DST-safe)
├── lib/lessons.ts            # /api/lessons and /api/lesson-series API functions
├── app/lessons/...           # tabs Upcoming/Past/Canceled + active weekly series, new (optional "Repetir toda semana"),
│                             # [id]/edit, [id]/request-change; cancel and end-series actions
├── lib/reschedule-requests.ts # /api/reschedule-requests API functions, 48h deadline helpers
├── app/requests/...          # students: their requests + withdraw; teachers: inbox with approve/reject
├── lib/tasks.ts, lib/assignments.ts # /api/tasks and /api/assignments API functions
├── app/tasks/...             # teacher task library: list (search, archived), new, [id] (assign, unassign), [id]/edit
├── app/assignments/...       # students: to-do + completed; teachers/admins: overview with filters;
│                             # [id]: student answers (until graded) and reads the grade; submit/grade actions
├── app/grading/...           # teacher queue (oldest submission first) and [id] grading page (score + feedback)
├── components/markdown.tsx   # safe Markdown (react-markdown, raw HTML shown as text, no images)
├── components/markdown-editor.tsx # Write/Preview editor, optional unsaved-changes warning
├── lib/flashcards.ts         # per-student cards (/api/students/{id}/cards, /api/cards) and /api/flashcards/progress
├── app/flashcards/...        # students: their words; teachers/admins: progress per student
├── app/students/[id]/flashcards # teacher adds (one or in bulk), edits and deletes a student's words
├── components/card-editor.tsx # card list with stage, inline edit, delete; AddCardForm
├── components/bulk-card-form.tsx # paste "palavra;tradução" lines (lib/card-lines.ts parses and previews)
├── lib/reviews.ts            # /api/reviews (queue, rate, progress)
├── app/study/...             # student study session, rating Server Action
├── components/study-session.tsx # reveal (Space), rate (1-4), Again re-queue, refetch when empty, summary
├── app/teachers/...          # admin pages: list, new, [id]/edit
├── app/login, change-password, not-allowed, session/expired
└── components/               # form and delete button (client components)
```

To add a new API resource: create `src/lib/<resource>.ts` using `apiFetch`, the pages in
`src/app/<resource>/` and the corresponding Server Actions. Start every page and Server Action with
`await requireUser([...roles])`.
