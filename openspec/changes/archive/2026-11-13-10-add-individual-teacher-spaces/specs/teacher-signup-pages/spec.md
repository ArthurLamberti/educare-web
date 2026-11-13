# Spec Delta

## Purpose

Lets a private teacher create their own space from the landing page, confirm the email and reach the login of the new space.

## ADDED Requirements

### Requirement: Sign-up page
The web app SHALL provide `/signup` on the root domain with fields for name, email, password (at least 8 characters), space name, address (slug) and time zone, showing the final address (`<slug>.<root domain>`) as the teacher types. The time zone SHALL default to the browser's. Field errors from the API SHALL be shown next to the fields without clearing what was typed (except the password).

#### Scenario: Successful sign-up
- **WHEN** a visitor fills valid data with a free address and submits
- **THEN** the page shows "Confirme seu e-mail" with the address the email was sent to and a "Reenviar link" button

#### Scenario: Address taken while typing
- **WHEN** the visitor types an address that is taken or reserved
- **THEN** the field shows "Esse endereço já está em uso" or "Esse endereço não pode ser usado" before submitting

#### Scenario: Too many attempts
- **WHEN** the API responds 429
- **THEN** the page shows "Muitas tentativas. Tente de novo em alguns minutos."

### Requirement: Landing call to action
The landing page SHALL offer a "Sou professor particular" action leading to `/signup`, besides the school finder.

#### Scenario: From the landing page
- **WHEN** a visitor clicks "Sou professor particular" on the root domain
- **THEN** the sign-up page opens

### Requirement: Email confirmation page
The web app SHALL provide `/confirm?token=` on the space's address, showing a "Confirmar meu e-mail" button; the token SHALL only be used when the button is pressed. On success it SHALL redirect to `/login?confirmed=1`; on failure it SHALL show "Este link é inválido ou expirou" with a way to request a new one.

#### Scenario: Valid link
- **WHEN** the teacher opens the link from the email and presses "Confirmar meu e-mail"
- **THEN** they land on the login page with the message "E-mail confirmado. Entre com sua senha."

#### Scenario: Link opened but not confirmed
- **WHEN** the link is only opened (e.g. by an email scanner) and the button is not pressed
- **THEN** the token is not used

#### Scenario: Expired link
- **WHEN** the API reports the token invalid or expired
- **THEN** the page shows "Este link é inválido ou expirou"
