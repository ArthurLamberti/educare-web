# Design

## Context

`src/proxy.ts` sends every root-domain request to the landing page and resolves the school from the subdomain otherwise. All API calls happen on the Next.js server (Server Components and Server Actions); the browser never calls the API. The UI is in Brazilian Portuguese.

## Decisions

- **Sign-up lives on the root domain** (`localhost:3000/signup`), next to the landing page, because the space does not exist yet. The proxy allows `/signup` on the root domain besides `/`. Confirmation and login live on the new space's subdomain, so the session cookie is set on the right host.
- **Address availability** is checked by a Server Action called from the client form, debounced (400 ms) and only for syntactically valid slugs; the form also validates the pattern locally and shows the final address (`ana-ingles.educare.com`). The submit still handles 409 (taken in the meantime).
- **Time zone** defaults to `Intl.DateTimeFormat().resolvedOptions().timeZone`, in a select of common zones (Brazil first) with the full IANA list available.
- **After submitting**, the same client component switches to a "Confirme seu e-mail" state that keeps the email in memory for "Reenviar link"; the email is never put in a URL.
- **Confirmation needs a click**: `/confirm?token=` renders a page with a "Confirmar meu e-mail" button (Server Action) instead of confirming on GET, so email link scanners and prefetchers cannot use up the single-use token. Success redirects to `/login?confirmed=1`, which shows "E-mail confirmado. Entre com sua senha." and pre-fills nothing else.
- **Login with unconfirmed email**: the login Server Action recognizes `code: EMAIL_NOT_CONFIRMED` and returns a state that shows the explanation and a "Reenviar link" button (resend with the typed email and the current slug).
- **Client IP forwarding**: `apiFetch` gets an option to forward the incoming request's client IP as `X-Forwarded-For`, used by the public sign-up calls only. Rate-limit answers (429) show "Muitas tentativas. Tente de novo em alguns minutos."
- **Settings page** `/settings`: `requireUser(["ADMIN", "TEACHER"])`, and teachers of a `SCHOOL` get the not-allowed page (the API also answers 403). Linked from the user menu as "Configurações" only for users who can use it. Time zone uses the same select as sign-up.
- **Kind-aware wording**: a small helper `placeWord(kind)` → "escola" / "espaço" used in the login panel, not-found page and settings title. Everything else is already neutral.

## Risks / Trade-offs

- [Typos in the email lock the teacher out until expiry] → The check-email screen shows the address it was sent to and lets the teacher start over; the unconfirmed space expires after 7 days.
- [Root domain now has a form, so it needs the API] → Only the public endpoints, which need no tenant.
