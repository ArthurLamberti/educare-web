# Proposal

## Why

Students must answer their assignments, teachers must grade them with a score and feedback, and students must see that feedback (educare-api change 07).

## What Changes

- Student assignment page gets an answer editor (Markdown with preview), submit/update until graded, "Submitted late" badge, and after grading the score (0-10) and feedback.
- Teacher "To grade" queue (oldest first, with count in navigation) and a grading page showing the instructions the student saw, the answer, and a score + feedback form; grades can be revised.
- Assignment lists show status, score when graded, and late flag.

## Capabilities

### New Capabilities
- `submission-pages`: answering, grading and feedback screens.

### Modified Capabilities
None.

## Impact

- `src/lib/assignments.ts` (submit, grade, types); `src/app/assignments/[id]/**`, `src/app/grading/**`; nav counter.
- Depends on educare-api change `07-add-submissions-and-grading` and web change 06.
