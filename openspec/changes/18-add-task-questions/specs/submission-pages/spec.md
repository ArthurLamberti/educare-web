# Spec Delta

## ADDED Requirements

### Requirement: Questions in pages
The task form SHALL let the teacher add, edit, reorder and remove open questions, and SHALL accept empty instructions when there is at least one question. For a task with questions, the answer page SHALL show one numbered field per question, all required to send and optional in a draft. The assignment and grading pages SHALL show each question followed by the student's answer.

#### Scenario: Answer a question block
- **WHEN** a student opens an assignment whose task has three questions
- **THEN** the page shows three numbered answer fields and "Enviar" refuses to send while one is empty
