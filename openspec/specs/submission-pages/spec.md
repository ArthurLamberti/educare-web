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

### Requirement: Save without sending
The student's answer form SHALL offer "Salvar rascunho", which keeps the text without showing it to the teacher, and "Enviar" ("Reenviar" after the first submission), until the grade is published; a saved draft SHALL be loaded back with its save time. The teacher's grading form SHALL offer "Salvar correção", which keeps score and feedback without showing them to the student, and "Enviar correção"; a saved correction SHALL be loaded back with its save time, and the grading queue SHALL mark assignments with a correction in progress.

#### Scenario: Student continues later
- **WHEN** a student saves a draft, leaves and opens the assignment again
- **THEN** the editor shows the draft and the time it was saved, and the teacher sees nothing new

#### Scenario: Teacher sends the correction
- **WHEN** a teacher saved a correction and later clicks "Enviar correção"
- **THEN** the student sees the score and feedback and the assignment is "Corrigida"

### Requirement: Questions in pages
The task form SHALL let the teacher add, edit, reorder and remove open questions, and SHALL accept empty instructions when there is at least one question. For a task with questions, the answer page SHALL show one numbered field per question, all required to send and optional in a draft. The assignment and grading pages SHALL show each question followed by the student's answer.

#### Scenario: Answer a question block
- **WHEN** a student opens an assignment whose task has three questions
- **THEN** the page shows three numbered answer fields and "Enviar" refuses to send while one is empty
