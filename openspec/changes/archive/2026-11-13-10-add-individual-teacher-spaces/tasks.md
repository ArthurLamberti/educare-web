# Tasks

## 1. Plumbing

- [x] 1.1 Allow `/signup` on the root domain in `src/proxy.ts`; add `kind` to the school and current-user types; add `lib/signup.ts` (availability, sign-up, confirm, resend) with client-IP forwarding in `apiFetch`; verify typecheck

## 2. Sign-up

- [x] 2.1 Build `/signup` (fields, local validation, debounced availability Server Action, final address preview, time zone select defaulting to the browser's) and the "Confirme seu e-mail" state with resend; verify in the browser a sign-up that sends an email to Mailpit
- [x] 2.2 Add the "Sou professor particular" call to action on the landing page; verify the link
- [x] 2.3 Build `/confirm` (button + Server Action, invalid/expired message, redirect to `/login?confirmed=1`); verify in the browser with the link from Mailpit, and that opening the link alone does not confirm

## 3. Session and settings

- [x] 3.1 Handle `EMAIL_NOT_CONFIRMED` on the login page with resend, and the `confirmed=1` message; verify in the browser
- [x] 3.2 Build `/settings` (name, time zone) for school admins and private teachers, menu link "Configurações", not-allowed for school teachers; verify in the browser
- [x] 3.3 Kind-aware wording ("escola"/"espaço") on login, not-found and settings; verify with a private teacher's space

## 4. Wrap-up

- [x] 4.1 Run lint, typecheck and build; update `README.md` (sign-up flow, Mailpit, new routes) and verify the full flow: sign up → confirm → log in → create a student and a lesson
