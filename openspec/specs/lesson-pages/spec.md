# lesson-pages Specification

## Purpose
Gives teachers pages to schedule and manage their lessons and gives students and admins views of the lessons that concern them, always in the school's time zone.

## Requirements

### Requirement: Lessons list by role
The web app SHALL show at `/lessons` the lessons visible to the user, grouped by day, with tabs Upcoming (default, from now), Past and Canceled. Each item SHALL show date, start-end time, topic and the other party's name (student for teachers, teacher for students, both for admins). Admins SHALL be able to filter by teacher and student.

#### Scenario: Teacher upcoming lessons
- **WHEN** a teacher opens `/lessons`
- **THEN** their upcoming scheduled lessons are listed chronologically, grouped by day

#### Scenario: Student view is read-only
- **WHEN** a student opens `/lessons`
- **THEN** they see their lessons without New, Edit or Cancel actions

### Requirement: School time zone
The web app SHALL display all lesson times in the school's time zone, and SHALL interpret dates and times entered in forms in that zone, regardless of the browser's zone.

#### Scenario: Different browser zone
- **WHEN** the school zone is `America/Sao_Paulo`, a teacher's browser is in `Europe/Lisbon`, and they schedule a lesson for 14:00
- **THEN** the lesson is stored as 14:00 São Paulo time and displayed as 14:00

### Requirement: Schedule and edit lessons
The web app SHALL let teachers create lessons at `/lessons/new` (student from their active students, date, start time, duration from a list of 15-240 minutes, topic, notes) and edit them at `/lessons/{id}/edit` (same fields except student). API field errors SHALL be shown next to fields and overlap conflicts (409) as a form message.

#### Scenario: Overlap
- **WHEN** the API responds 409 because the teacher already has a lesson at that time
- **THEN** the form shows the API message and keeps the values

### Requirement: Cancel lesson
The web app SHALL let teachers cancel a scheduled lesson after confirmation; the lesson moves to the Canceled tab.

#### Scenario: Cancel
- **WHEN** the teacher confirms cancellation
- **THEN** the lesson disappears from Upcoming and appears in Canceled

### Requirement: Next lessons on home
The web app SHALL show teachers and students their next 5 upcoming lessons on the home page, with a link to `/lessons`.

#### Scenario: Student home
- **WHEN** a student with lessons opens the home page
- **THEN** their next lessons are listed with date, time, topic and teacher

### Requirement: Online lesson in the form and list
The lesson form SHALL have an "Aula online" option that requires a "Link da sala" starting with `http://` or `https://`. Upcoming scheduled online lessons SHALL show "Entrar na sala" to their teacher and student, opening the link in a new tab.

#### Scenario: Missing link
- **WHEN** the teacher checks "Aula online" and leaves the link empty
- **THEN** the form shows "Informe o link da sala"

### Requirement: Lesson page with notes
`/lessons/[id]` SHALL show the lesson and its "Anotações da aula": an editable text box with "Salvar anotações" for the lesson's teacher, and the saved text (line breaks kept) with its update time for the student and admins, or a message when there are none.

#### Scenario: Student reads notes
- **WHEN** the teacher saved notes and the student opens the lesson
- **THEN** the student sees the notes as read-only text
