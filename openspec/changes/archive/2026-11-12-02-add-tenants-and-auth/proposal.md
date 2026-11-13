# Proposal

## Why

The API now (educare-api change 02) identifies the school with the `X-Tenant` header and requires a login token on every call. The web app must serve each school on its own subdomain, let users log in and out, keep the session safely on the server, force the first password change, show navigation by role, and give school admins a way to manage teachers.

## What Changes

- **Tenant from subdomain**: `<slug>.educare.com` (dev: `<slug>.localhost:3000`) selects the school. The root domain shows a short landing page; an unknown school shows a "School not found" page.
- **Login/logout**: `/login` page per school; the API token is kept in an httpOnly cookie that is only valid on that school's subdomain; logout clears it.
- **Protected app**: every page except login requires a session; expired or invalid sessions go back to `/login`.
- **Forced password change**: users flagged `mustChangePassword` are sent to `/change-password` before anything else; any user can change it from the account menu.
- **Role-based navigation**: menu items per role (admin: Teachers, Students; teacher: Students; student: their area, filled by later changes).
- **Teacher management pages** for admins: list, create (with initial password), edit, deactivate/reactivate.
- Every API call sends `X-Tenant` and `Authorization`.

## Capabilities

### New Capabilities
- `tenant-routing`: mapping subdomains to schools, root and unknown-school pages.
- `session`: login, logout, session cookie, route protection, forced password change, role-based navigation.
- `teacher-pages`: admin pages to manage teachers.

### Modified Capabilities
- `student-pages`: pages now require an admin or teacher session.

## Impact

- New `src/proxy.ts`, `src/lib/tenant.ts`, `src/lib/session.ts`, `src/lib/auth.ts` (data access layer), `src/lib/teachers.ts`; `src/lib/api.ts` adds headers and 401 handling.
- New routes: `/login`, `/change-password`, `/teachers/**`; layout gets a user menu.
- New env vars: `ROOT_DOMAIN`.
- Depends on educare-api change `02-add-tenants-and-auth`.
