# student-pages Specification

## Purpose

Gives users web pages to list, create, edit and delete students, backed by the educare-api student endpoints.

## Requirements

### Requirement: Student list page
The web app SHALL show students at `/students` in a table (name, email, birth date, and teacher for admins) with 20 per page, previous/next links when there is more than one page, and an empty-state message when there are none. Teachers SHALL see their students; admins SHALL see all students and MAY filter by teacher. A "Show inactive" toggle SHALL include deactivated students, shown greyed out with a "Reactivate" action.

#### Scenario: Students exist
- **WHEN** a user opens `/students` and the API returns students
- **THEN** the page shows one row per student with Edit and Deactivate actions

#### Scenario: No students
- **WHEN** a user opens `/students` and the API returns an empty page
- **THEN** the page shows "No students registered."

#### Scenario: Admin filters by teacher
- **WHEN** an admin picks a teacher in the filter
- **THEN** only that teacher's students are listed and the URL keeps the filter

#### Scenario: Show inactive
- **WHEN** the user turns on "Show inactive"
- **THEN** deactivated students appear greyed out with a "Reactivate" action

### Requirement: Create and edit student forms
The web app SHALL provide `/students/new` (name, email, birth date, initial password; admins also choose the teacher) and `/students/{id}/edit` (name, email, birth date; admins also the teacher) forms that save through the API and return to `/students` on success. After creating, the list SHALL show a notice reminding the user to give the student their initial password.

#### Scenario: API validation error
- **WHEN** the user submits the form and the API responds 400 with an `errors` map
- **THEN** the form keeps the typed values (except the password) and shows each field's error next to it

#### Scenario: Unknown student
- **WHEN** a user opens `/students/{id}/edit` for an id the API reports as 404
- **THEN** the not-found page is shown

#### Scenario: Created notice
- **WHEN** a teacher creates a student
- **THEN** the list shows "Student created. Share the initial password with them."

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

### Requirement: Deactivate and reactivate student
The web app SHALL replace Delete with Deactivate, asking for confirmation with the text "The student will lose access but their history is kept", and SHALL offer Reactivate for inactive students. The list SHALL refresh after either action.

#### Scenario: Confirmed deactivation
- **WHEN** the user clicks Deactivate on a row and confirms
- **THEN** the student is deactivated through the API and disappears from the default list

#### Scenario: Reactivate
- **WHEN** the user clicks Reactivate on an inactive student
- **THEN** the student becomes active and shows normally
