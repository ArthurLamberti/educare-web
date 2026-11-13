# Spec Delta

## Purpose

Serves each school on its own subdomain so that every page and API call of the web app happens in the context of exactly one school.

## ADDED Requirements

### Requirement: School from subdomain
The web app SHALL take the school slug from the first label of the request host when the host is a subdomain of the configured root domain (`ROOT_DOMAIN`, e.g. `educare.com` or `localhost:3000`), and SHALL send it as `X-Tenant` on every API call made for that request.

#### Scenario: School subdomain
- **WHEN** a user opens `http://demo.localhost:3000/login`
- **THEN** the login page is shown for school `demo` and API calls carry `X-Tenant: demo`

### Requirement: Root domain landing
The web app SHALL show a landing page on the root domain explaining that each school has its own address (`<school>.<root domain>`), with no login form and no API calls requiring a tenant.

#### Scenario: Root domain
- **WHEN** a user opens `http://localhost:3000/`
- **THEN** a landing page asking to use the school's address is shown

### Requirement: Unknown school
The web app SHALL show a "School not found" page, with HTTP status 404 where possible, when the API reports the subdomain's tenant as unknown.

#### Scenario: Unknown subdomain
- **WHEN** a user opens `http://nope.localhost:3000/login` and the API responds 404 for tenant `nope`
- **THEN** the "School not found" page is shown

### Requirement: School name in the interface
The web app SHALL display the school name in the header of authenticated pages.

#### Scenario: Header
- **WHEN** a logged-in user of "Demo School" opens any page
- **THEN** the header shows "Demo School"
