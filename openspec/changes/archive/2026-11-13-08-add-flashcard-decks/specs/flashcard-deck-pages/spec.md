# Spec Delta

## Purpose

Gives teachers pages to author flashcard decks and propose them to students, and shows students the decks proposed to them.

## ADDED Requirements

### Requirement: Deck list and form
The web app SHALL show teachers their decks at `/decks` (title, card count, students count) with a "Show archived" toggle, and provide create/edit forms (title, description) and archive/unarchive actions.

#### Scenario: Create deck
- **WHEN** a teacher creates a deck
- **THEN** they land on the deck page with an empty card list

### Requirement: Card editor
The web app SHALL let the deck's teacher add cards (front, back), edit them inline, delete with confirmation, and reorder them with move up/down controls, saving each change through the API and showing field errors.

#### Scenario: Add card
- **WHEN** the teacher fills front and back and clicks Add
- **THEN** the card appears at the end of the list and the form clears for the next card

#### Scenario: Reorder
- **WHEN** the teacher moves a card up
- **THEN** the new order is saved and kept after reload

### Requirement: Propose deck to students
The web app SHALL show on the deck page the students who have the deck, with Remove, and a selector of the teacher's other active students to add. Archived decks SHALL not offer adding students.

#### Scenario: Propose
- **WHEN** the teacher selects two students and confirms
- **THEN** both appear in the deck's students list

### Requirement: Student decks
The web app SHALL show students at `/decks` the decks proposed to them (title, description, teacher, card count) and a read-only page listing each deck's cards.

#### Scenario: Student list
- **WHEN** a student opens `/decks`
- **THEN** only decks proposed to them are shown
