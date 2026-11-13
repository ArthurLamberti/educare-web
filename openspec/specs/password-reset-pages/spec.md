# password-reset-pages Specification

## Purpose
Gives every login page a "forgot password" path: ask for a link by email, then set a new password from it.

## Requirements

### Requirement: Forgot password pages
The login page of every school and space SHALL link to `/forgot-password`, which asks for the email and always shows the same "se houver uma conta" answer. `/reset-password?token=` SHALL ask for the new password twice and, when saved, send to `/login?reset=1` with "Senha alterada". An invalid link SHALL say so and offer a new one.

#### Scenario: Reset from the email
- **WHEN** a user opens the link and saves a new password
- **THEN** they land on the login page with "Senha alterada. Entre com a nova senha."
