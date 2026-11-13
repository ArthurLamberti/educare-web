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

Open http://localhost:3000.

## How it talks to the API

API calls happen **only on the Next.js server** (Server Components for reads and Server Actions
for writes). The browser never calls Spring directly, so no CORS configuration is needed in the API
and `API_URL` is never exposed to the client.

```
src/
├── lib/api.ts                # base fetch, ApiError (ProblemDetail), Page<T> normalization
├── lib/students.ts           # /api/students API functions
├── app/students/actions.ts   # Server Actions: save / remove
├── app/students/...          # pages: list, new, [id]/edit
└── components/               # form and delete button (client components)
```

To add a new API resource: create `src/lib/<resource>.ts` using `apiFetch`, the pages in
`src/app/<resource>/` and the corresponding Server Actions.
