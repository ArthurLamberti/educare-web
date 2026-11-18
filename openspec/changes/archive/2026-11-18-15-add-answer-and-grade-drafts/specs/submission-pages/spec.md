# Spec Delta

## ADDED Requirements

### Requirement: Save without sending
The student's answer form SHALL offer "Salvar rascunho", which keeps the text without showing it to the teacher, and "Enviar" ("Reenviar" after the first submission), until the grade is published; a saved draft SHALL be loaded back with its save time. The teacher's grading form SHALL offer "Salvar correção", which keeps score and feedback without showing them to the student, and "Enviar correção"; a saved correction SHALL be loaded back with its save time, and the grading queue SHALL mark assignments with a correction in progress.

#### Scenario: Student continues later
- **WHEN** a student saves a draft, leaves and opens the assignment again
- **THEN** the editor shows the draft and the time it was saved, and the teacher sees nothing new

#### Scenario: Teacher sends the correction
- **WHEN** a teacher saved a correction and later clicks "Enviar correção"
- **THEN** the student sees the score and feedback and the assignment is "Corrigida"
