# Proposal

## Why

The API (change 10) lets private teachers create their own space. The web app must offer the sign-up from the landing page, the email confirmation, and the few screens a private teacher needs that today only exist for operators or admins (space name and time zone).

## What Changes

- Landing page: a "Sou professor particular" call to action and a `/signup` page on the root domain (name, email, password, space name, address with live availability, time zone pre-filled from the browser).
- After sign-up: "Confirme seu e-mail" screen with "Reenviar link".
- Confirmation page on the space's address (`<slug>.<root>/confirm?token=`) with a "Confirmar meu e-mail" button, then login with a success message.
- Login: when the API answers `EMAIL_NOT_CONFIRMED`, explain it and offer to resend the link.
- New `/settings` page (space or school name, time zone) for school admins and private teachers, linked from the user menu.
- Wording adapts to the tenant kind: "espaço" instead of "escola" where a private teacher would read it.
- Server-side calls to the public API endpoints forward the browser's IP (`X-Forwarded-For`) for the API's rate limits.

## Capabilities

### New Capabilities
- `teacher-signup-pages`: sign-up form, address availability, check-your-email, confirmation page, resend.
- `space-settings-pages`: settings page for name and time zone.

### Modified Capabilities
- `tenant-routing`: the root domain serves the landing and the sign-up pages; kind-aware wording.
- `session`: login handles unconfirmed email; user menu links to settings.

## Non-Goals

Billing, multi-school accounts, turning a space into a school, social login, password reset (see API change 10).

## Impact

- New `src/app/signup/**`, `src/app/confirm/**`, `src/app/settings/**`, `src/lib/signup.ts`, `src/lib/tenant.ts` additions; changes in `src/proxy.ts` (root-domain routes), `lib/api.ts` (forwarded IP for public calls), login form, header menu, landing.
- Depends on educare-api change `10-add-individual-teacher-spaces`.
