# Proposal

## Why

Teachers propose flashcards to their students (educare-api change 08). They need pages to write decks and cards and to choose which students get each deck; students need to see their decks.

## What Changes

- Teacher "Flashcards": deck list (title, card count, number of students, archived toggle), create/edit deck, card editor (add, edit inline, delete, reorder), and "Students" panel to propose/remove the deck.
- Student "Flashcards": list of their decks with card count (study button added by change 09) and a read-only card browser.

## Capabilities

### New Capabilities
- `flashcard-deck-pages`: deck and card authoring, proposing decks to students, student deck list.

### Modified Capabilities
None.

## Impact

- New `src/lib/decks.ts`, `src/app/decks/**`; a client card editor component.
- Depends on educare-api change `08-add-flashcard-decks`.
