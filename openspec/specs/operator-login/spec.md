# operator-login Specification

## Purpose
Lets platform admins log in to the operator panel on the root domain with their own email and password.

## Requirements

### Requirement: Operator login with an admin account
`/admin/login` SHALL take the platform admin's email and password and keep the returned token in an httpOnly cookie limited to `/admin` until it expires. It SHALL link to `/admin/forgot-password` ("Esqueci a senha (ou primeiro acesso)"). An expired or rejected token SHALL send back to `/admin/login`.

#### Scenario: First access
- **WHEN** the default admin asks for a link on `/admin/forgot-password` and sets a password
- **THEN** they can log in to the operator panel
