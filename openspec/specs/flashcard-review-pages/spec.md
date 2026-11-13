# flashcard-review-pages Specification

## Purpose
Lets students study their flashcards in a focused spaced-repetition session and lets teachers follow each student's progress per deck.

## Requirements

### Requirement: Study session
The web app SHALL provide `/study` (all decks) and `/study?deck={id}` sessions that load the review queue, show one card's front at a time with a "Show answer" button, then the back with Again, Hard, Good and Easy buttons. Each rating SHALL be sent to the API before the next card is shown; cards rated Again SHALL come back later in the same session when due. The session SHALL show remaining cards and end with a summary (cards reviewed) when the queue is empty.

#### Scenario: Review a card
- **WHEN** a student reveals a card and clicks Good
- **THEN** the rating is saved and the next card's front is shown

#### Scenario: Nothing to review
- **WHEN** the queue is empty
- **THEN** the page shows "All done for today" and when the next card is due

#### Scenario: Keyboard
- **WHEN** the student presses Space to reveal and 1-4 to rate
- **THEN** the same actions as the buttons happen

#### Scenario: Rating fails
- **WHEN** saving a rating fails
- **THEN** the card stays on screen with an error and the student can retry

### Requirement: Due counts
The web app SHALL show on the student's `/decks` list the cards due today per deck with a "Study" button, and on the home page "N cards to review today" linking to `/study`.

#### Scenario: Home reminder
- **WHEN** a student has 12 due cards
- **THEN** the home page shows "12 cards to review today"

### Requirement: Teacher progress view
The web app SHALL show on the teacher's deck page a progress table with one row per student: new, learning, mature, due today and reviews in the last 7 days.

#### Scenario: Progress
- **WHEN** a teacher opens a deck proposed to two students
- **THEN** the progress table shows both students with their counters
