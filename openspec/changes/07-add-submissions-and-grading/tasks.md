# Tasks

## 1. Data layer

- [ ] 1.1 Extend `src/lib/assignments.ts` with submission/grade types and `submitAnswer`, `gradeAssignment`; verify `npx tsc --noEmit` passes

## 2. Student

- [ ] 2.1 Add the answer editor with preview, submit/update actions, late badge and read-only state after grading; verify first submission, update, and locked graded work
- [ ] 2.2 Show score and feedback on the detail page and score in the list; verify with a graded assignment

## 3. Teacher

- [ ] 3.1 Implement `/grading` queue and nav counter; verify oldest-first order
- [ ] 3.2 Implement the grading page (snapshot, answer, score + feedback form, revise) with 400 and 409 handling; verify invalid score error and the concurrent-edit message

## 4. Integration

- [ ] 4.1 Run student submits → teacher grades → student reads feedback; confirm `npm run lint` and `npm run build` pass
