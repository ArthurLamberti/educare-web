# submission-pages Specification

## Purpose
Lets students answer assignments and read their teacher's grade and feedback, and lets teachers grade submissions from a queue.

## Requirements

### Requirement: Answer an assignment
The web app SHALL show on a student's assignment page an answer editor with preview, a "Submit" button for the first submission and "Update answer" afterwards, while the assignment is not graded. After grading, the answer SHALL be read-only. Late submissions SHALL show a "Submitted late" badge.

#### Scenario: First submission
- **WHEN** a student writes an answer and submits
- **THEN** the page shows status Submitted with the submission time

#### Scenario: Graded work is locked
- **WHEN** the assignment is graded
- **THEN** the answer is shown read-only without the editor

### Requirement: See grade and feedback
The web app SHALL show students the score (e.g. "8.5 / 10") and the feedback rendered as Markdown on graded assignments, and the score in their assignments list.

#### Scenario: Student reads feedback
- **WHEN** a student opens a graded assignment
- **THEN** the score and feedback are displayed above their answer

### Requirement: Grading queue
The web app SHALL show teachers a "To grade" navigation item with the number of submitted assignments and a `/grading` page listing them oldest submission first (student, task, submitted at, late flag).

#### Scenario: Queue
- **WHEN** a teacher opens `/grading`
- **THEN** submitted assignments are listed with the oldest first

### Requirement: Grade a submission
The web app SHALL provide a grading page showing the instructions snapshot, the student's answer and a form with score (0-10, step 0.1) and feedback (Markdown). Saving SHALL return to the queue; graded items SHALL be editable to revise the grade.

#### Scenario: Invalid score
- **WHEN** the API responds 400 for the score
- **THEN** the form shows the error next to the score and keeps the feedback

#### Scenario: Student updated the answer meanwhile
- **WHEN** the API responds 409 because the submission changed
- **THEN** the page shows a message asking to reload and review the new answer
