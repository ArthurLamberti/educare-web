# Spec Delta

## MODIFIED Requirements

### Requirement: Login page
The web app SHALL provide `/login` with email and password fields. On success it SHALL store the session and redirect to the page originally requested (only same-site paths) or to the home page. On failure it SHALL show the API's message without clearing the email. When the API reports the email is not confirmed, it SHALL explain it and offer "Reenviar link". With `confirmed=1` it SHALL show "E-mail confirmado. Entre com sua senha."

#### Scenario: Successful login
- **WHEN** a user submits valid credentials on `demo.localhost:3000/login`
- **THEN** they are redirected to the home page and see their name in the header

#### Scenario: Invalid credentials
- **WHEN** the API responds 401
- **THEN** the page shows the invalid credentials message and keeps the email typed

#### Scenario: Return to requested page
- **WHEN** a logged-out user opens `/students`, is sent to login and logs in
- **THEN** they land on `/students`

#### Scenario: Open redirect attempt
- **WHEN** the login URL carries `next=https://evil.example`
- **THEN** after login the user lands on the home page

#### Scenario: Email not confirmed
- **WHEN** the API responds 403 with `code: EMAIL_NOT_CONFIRMED`
- **THEN** the page says the email must be confirmed first and offers "Reenviar link"
