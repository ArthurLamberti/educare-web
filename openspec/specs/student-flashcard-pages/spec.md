# student-flashcard-pages Specification

## Purpose
TBD - created by archiving change 14-prevent-duplicate-flashcards. Update Purpose after archive.

## Requirements

### Requirement: Duplicate flashcards feedback
When the API refuses a card as a duplicate, the card form SHALL show "Essa palavra já está nos flashcards do aluno" and keep the typed values. When cards are added in bulk or sent from a lesson's words, the page SHALL show how many were skipped as duplicates and which ones.

#### Scenario: Bulk with duplicates
- **WHEN** the teacher adds a list where two words already exist
- **THEN** the other cards are added and the page says that two cards already existed, naming them

#### Scenario: Single duplicate
- **WHEN** the teacher adds a card the student already has
- **THEN** the form shows "Essa palavra já está nos flashcards do aluno" with the typed values kept
