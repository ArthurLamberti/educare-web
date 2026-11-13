# Proposal

## Why

Students review flashcards with spaced repetition (educare-api change 09). They need a focused study session that shows due cards and records their ratings, and teachers want to see whether students keep up.

## What Changes

- Student "Study" session per deck (or all decks): shows the front, reveals the back, four rating buttons (Again, Hard, Good, Easy) with the next interval hinted, progress counter, and a finish screen.
- Student deck list shows cards due today and a "Study" button; home shows "N cards to review today".
- Teacher deck page shows per-student progress (new, learning, mature, due today, reviews in the last 7 days).

## Capabilities

### New Capabilities
- `flashcard-review-pages`: study session, due counts, and teacher progress view.

### Modified Capabilities
None.

## Impact

- New `src/lib/reviews.ts`, `src/app/study/**`, client study component; updates to `/decks` pages and home.
- Depends on educare-api change `09-add-spaced-repetition` and web change 08.
