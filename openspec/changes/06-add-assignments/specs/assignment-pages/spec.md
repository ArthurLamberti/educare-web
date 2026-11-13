# Spec Delta

## Purpose

Gives teachers pages to keep a task library and assign tasks to students, and gives students a clear list of the work assigned to them.

## ADDED Requirements

### Requirement: Task library pages
The web app SHALL show teachers their tasks at `/tasks` (title, last update, number of assignments) with title search and a "Show archived" toggle, and SHALL provide create and edit forms with title and Markdown instructions plus a preview. Delete SHALL be offered only when the task has no assignments; otherwise Archive/Unarchive.

#### Scenario: Search
- **WHEN** a teacher types "verbs" in the search
- **THEN** only tasks whose title matches are listed

#### Scenario: Delete blocked
- **WHEN** a task has assignments
- **THEN** no Delete action is shown, only Archive

### Requirement: Assign task
The web app SHALL let a teacher assign a task from its page by selecting one or more of their active students and an optional due date and time (school zone). Errors from the API (already assigned, archived task) SHALL be shown in the form. The task page SHALL list its assignments with student, due date and status, with Unassign for `ASSIGNED` items.

#### Scenario: Assign to several
- **WHEN** a teacher selects two students and a due date and submits
- **THEN** both appear in the task's assignment list with status Assigned

#### Scenario: Already assigned
- **WHEN** the API responds 409
- **THEN** the form shows the API message and keeps the selection

### Requirement: Student assignments list
The web app SHALL show students at `/assignments` their pending assignments first (soonest due first, overdue items highlighted with "Overdue"), then submitted and graded ones, and a detail page with the task title, due date and instructions rendered from Markdown without allowing raw HTML.

#### Scenario: Overdue
- **WHEN** a pending assignment's due date has passed
- **THEN** it is highlighted with "Overdue"

#### Scenario: Unsafe content
- **WHEN** instructions contain `<script>` or raw HTML
- **THEN** it is shown as text, not executed or rendered as HTML

### Requirement: Teacher assignments overview
The web app SHALL show teachers at `/assignments` all assignments of their tasks, filterable by student and status.

#### Scenario: Filter by student
- **WHEN** a teacher filters by one student
- **THEN** only that student's assignments are listed
