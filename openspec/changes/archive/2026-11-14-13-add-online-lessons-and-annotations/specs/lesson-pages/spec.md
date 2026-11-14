# Spec Delta

## ADDED Requirements

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
