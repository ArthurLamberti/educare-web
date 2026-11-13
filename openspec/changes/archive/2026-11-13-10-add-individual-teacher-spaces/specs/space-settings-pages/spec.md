# Spec Delta

## Purpose

Lets the person responsible for a school or private space change its name and time zone.

## ADDED Requirements

### Requirement: Settings page
The web app SHALL provide `/settings` with the name and time zone of the current school or space, for admins of a school and the teacher of an individual space, linked from the user menu as "Configurações". Saving SHALL update the header and dates immediately. Other users SHALL see the not-allowed page and no menu link.

#### Scenario: Private teacher changes the time zone
- **WHEN** a private teacher changes the time zone to `America/Manaus` and saves
- **THEN** a success message is shown and lesson times are shown in the new zone

#### Scenario: School teacher
- **WHEN** a teacher of a school opens `/settings`
- **THEN** the "not allowed" page is shown
