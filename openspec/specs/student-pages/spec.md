# student-pages Specification

## Purpose

Gives users web pages to list, create, edit and delete students, backed by the educare-api student endpoints.

## Requirements

### Requirement: Student list page
The web app SHALL show students at `/students` in a table (name, email, birth date) with 20 per page, previous/next links when there is more than one page, and an empty-state message when there are none.

#### Scenario: Students exist
- **WHEN** a user opens `/students` and the API returns students
- **THEN** the page shows one row per student with Edit and Delete actions

#### Scenario: No students
- **WHEN** a user opens `/students` and the API returns an empty page
- **THEN** the page shows "No students registered."

### Requirement: Create and edit student forms
The web app SHALL provide `/students/new` and `/students/{id}/edit` forms with name, email and birth date that save through the API and return to `/students` on success.

#### Scenario: API validation error
- **WHEN** the user submits the form and the API responds 400 with an `errors` map
- **THEN** the form keeps the typed values and shows each field's error next to it

#### Scenario: Unknown student
- **WHEN** a user opens `/students/{id}/edit` for an id the API reports as 404
- **THEN** the not-found page is shown

### Requirement: Delete student
The web app SHALL ask for confirmation before deleting a student and refresh the list afterwards.

#### Scenario: Confirmed deletion
- **WHEN** the user clicks Delete on a row and confirms
- **THEN** the student is deleted through the API and disappears from the list

### Requirement: API unavailable
The web app SHALL show an error state with a retry button when the student data cannot be loaded.

#### Scenario: API down
- **WHEN** the API cannot be reached while loading `/students`
- **THEN** the page shows "Could not load the data" and a "Try again" button

### Requirement: Student pages require staff session
The web app SHALL only show the student pages to logged-in `ADMIN` and `TEACHER` users; other users SHALL be redirected to login or shown the "not allowed" page.

#### Scenario: Logged out
- **WHEN** a logged-out user opens `/students`
- **THEN** they are redirected to `/login?next=/students`
