# Spec Delta

## Purpose

Lets users of a school log in and out of the web app, keeps their session secure on the server, and shows each role the pages it is allowed to use.

## ADDED Requirements

### Requirement: Login page
The web app SHALL provide `/login` with email and password fields. On success it SHALL store the session and redirect to the page originally requested (only same-site paths) or to the home page. On failure it SHALL show the API's message without clearing the email.

#### Scenario: Successful login
- **WHEN** a user submits valid credentials on `demo.localhost:3000/login`
- **THEN** they are redirected to the home page and see their name in the header

#### Scenario: Invalid credentials
- **WHEN** the API responds 401
- **THEN** the page shows "Invalid email or password" and keeps the email typed

#### Scenario: Return to requested page
- **WHEN** a logged-out user opens `/students`, is sent to login and logs in
- **THEN** they land on `/students`

#### Scenario: Open redirect attempt
- **WHEN** the login URL carries `next=https://evil.example`
- **THEN** after login the user lands on the home page

### Requirement: Session storage
The web app SHALL keep the API token only in an httpOnly, `SameSite=Lax` cookie (Secure in production) scoped to the school's host and expiring with the token. The token SHALL never be exposed to client-side JavaScript or to another school's subdomain.

#### Scenario: Other school
- **WHEN** a user logged in on `alpha.localhost:3000` opens `beta.localhost:3000`
- **THEN** they are not logged in on `beta`

### Requirement: Protected pages
The web app SHALL redirect requests without a session to `/login?next=<path>` for every page except `/login` and the root-domain landing page. When the API rejects the token (401), the web app SHALL clear the session and redirect to `/login`. Server Actions SHALL check the session themselves and not rely only on page protection.

#### Scenario: No session
- **WHEN** a logged-out user opens `/teachers`
- **THEN** they are redirected to `/login?next=/teachers`

#### Scenario: Token rejected
- **WHEN** the API responds 401 to a page's call because the user was deactivated
- **THEN** the session is cleared and the user is redirected to `/login`

### Requirement: Logout
The web app SHALL provide a logout action in the user menu that deletes the session cookie and redirects to `/login`.

#### Scenario: Logout
- **WHEN** the user clicks "Log out"
- **THEN** they are on `/login` and opening `/students` redirects back to login

### Requirement: Forced password change
The web app SHALL redirect a user whose `mustChangePassword` is true to `/change-password` from any other page until they change it. The page SHALL ask for current password, new password (min 8) and confirmation, and show field errors from the API. Any logged-in user SHALL be able to open it from the user menu.

#### Scenario: First login
- **WHEN** a teacher with a temporary password logs in
- **THEN** they are sent to `/change-password` and, after changing it, to the home page

#### Scenario: Confirmation mismatch
- **WHEN** new password and confirmation differ
- **THEN** the form shows an error on the confirmation field without calling the API

### Requirement: Role-based navigation and access
The web app SHALL show navigation links by role (`ADMIN`: Teachers, Students; `TEACHER`: Students; `STUDENT`: student area items added by later changes) and SHALL show a "not allowed" page when a user opens a page their role cannot use (API 403).

#### Scenario: Student opens admin page
- **WHEN** a student opens `/teachers`
- **THEN** the "You don't have access to this page" page is shown
