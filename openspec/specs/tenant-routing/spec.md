# tenant-routing Specification

## Purpose
Serves each school on its own subdomain so that every page and API call of the web app happens in the context of exactly one school.

## Requirements

### Requirement: School from subdomain
The web app SHALL take the school slug from the first label of the request host when the host is a subdomain of the configured root domain (`ROOT_DOMAIN`, e.g. `educare.com` or `localhost:3000`), and SHALL send it as `X-Tenant` on every API call made for that request.

#### Scenario: School subdomain
- **WHEN** a user opens `http://demo.localhost:3000/login`
- **THEN** the login page is shown for school `demo` and API calls carry `X-Tenant: demo`

### Requirement: Root domain landing
The web app SHALL show a landing page on the root domain explaining that each school or private teacher has its own address (`<address>.<root domain>`), with a school finder and the private-teacher sign-up, and no login form. The root domain SHALL serve only the landing page and the sign-up pages, and SHALL call only API endpoints that need no tenant.

#### Scenario: Root domain
- **WHEN** a user opens `http://localhost:3000/`
- **THEN** a landing page with the school finder and "Sou professor particular" is shown

#### Scenario: Sign-up on the root domain
- **WHEN** a user opens `http://localhost:3000/signup`
- **THEN** the sign-up page is shown

### Requirement: Unknown school
The web app SHALL show a "School not found" page, with HTTP status 404 where possible, when the API reports the subdomain's tenant as unknown.

#### Scenario: Unknown subdomain
- **WHEN** a user opens `http://nope.localhost:3000/login` and the API responds 404 for tenant `nope`
- **THEN** the "School not found" page is shown

### Requirement: School name in the interface
The web app SHALL display the school or space name in the header of authenticated pages, and SHALL say "espaço" instead of "escola" on the login, not-found and settings pages of an individual space.

#### Scenario: Header
- **WHEN** a logged-in user of "Demo School" opens any page
- **THEN** the header shows "Demo School"

#### Scenario: Private teacher's space
- **WHEN** a visitor opens the login page of an individual space
- **THEN** the texts refer to the "espaço", not the "escola"
