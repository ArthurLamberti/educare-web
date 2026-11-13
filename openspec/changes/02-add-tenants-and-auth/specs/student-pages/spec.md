# Spec Delta

## ADDED Requirements

### Requirement: Student pages require staff session
The web app SHALL only show the student pages to logged-in `ADMIN` and `TEACHER` users; other users SHALL be redirected to login or shown the "not allowed" page.

#### Scenario: Logged out
- **WHEN** a logged-out user opens `/students`
- **THEN** they are redirected to `/login?next=/students`
