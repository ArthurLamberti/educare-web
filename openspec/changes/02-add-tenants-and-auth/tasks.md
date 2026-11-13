# Tasks

## 1. Tenant routing

- [ ] 1.1 Read `node_modules/next/dist/docs` pages for `proxy`, `cookies`, `headers`, `forbidden`/`authInterrupts` and authentication with Cache Components, and note any differences from this design in design.md
- [ ] 1.2 Add `ROOT_DOMAIN` to `.env.example`, implement `src/proxy.ts` (host → `x-tenant-slug`, root-domain landing, matcher excluding static assets) and `src/lib/tenant.ts`; verify `curl -H 'Host: demo.localhost:3000'` reaches pages and the root host shows the landing page
- [ ] 1.3 Update `src/lib/api.ts` to send `X-Tenant` and `Authorization`, map 401/403/tenant-404; verify `npm run build` and the "School not found" page for an unknown subdomain

## 2. Session

- [ ] 2.1 Implement `src/lib/session.ts` (cookie read/write/delete) and the `/login` page with Server Action, safe `next` handling and error display; verify logging in on `demo.localhost:3000` with the API's dev seed user and that `next=https://evil.example` lands on home
- [ ] 2.2 Implement `src/lib/auth.ts` (`getCurrentUser` with `use cache: private`, `requireUser(roles)`), the session-expired route handler, logout action, and proxy redirect for missing cookie; verify logged-out access redirects with `next`, logout works, and a deactivated user is sent to login
- [ ] 2.3 Implement `/change-password` with forced redirect when `mustChangePassword`; verify the first-login flow and confirmation mismatch error
- [ ] 2.4 Render header (school name, role-based nav, user menu) behind `<Suspense>` and the "not allowed" page; verify each role sees the right links and a student opening `/teachers` sees "not allowed"

## 3. Teachers and students

- [ ] 3.1 Implement `src/lib/teachers.ts` and `/teachers` list, new, edit, deactivate/reactivate; verify against the API: create (with reminder), duplicate email error, deactivate/reactivate
- [ ] 3.2 Protect student pages and actions with `requireUser(['ADMIN','TEACHER'])`; verify `/students` redirects when logged out

## 4. Integration

- [ ] 4.1 Run the full flow with both apps: provision/seed school → admin login → forced password change → create teacher → teacher login → students page; confirm `npm run lint` and `npm run build` pass and update README (subdomain URLs, env vars)
