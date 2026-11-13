# Spec Delta

## MODIFIED Requirements

### Requirement: Root domain landing
The web app SHALL show a landing page on the root domain explaining that each school or private teacher has its own address (`<address>.<root domain>`), with a school finder and the private-teacher sign-up, and no login form. The root domain SHALL serve only the landing page and the sign-up pages, and SHALL call only API endpoints that need no tenant.

#### Scenario: Root domain
- **WHEN** a user opens `http://localhost:3000/`
- **THEN** a landing page with the school finder and "Sou professor particular" is shown

#### Scenario: Sign-up on the root domain
- **WHEN** a user opens `http://localhost:3000/signup`
- **THEN** the sign-up page is shown

### Requirement: School name in the interface
The web app SHALL display the school or space name in the header of authenticated pages, and SHALL say "espaço" instead of "escola" on the login, not-found and settings pages of an individual space.

#### Scenario: Header
- **WHEN** a logged-in user of "Demo School" opens any page
- **THEN** the header shows "Demo School"

#### Scenario: Private teacher's space
- **WHEN** a visitor opens the login page of an individual space
- **THEN** the texts refer to the "espaço", not the "escola"
