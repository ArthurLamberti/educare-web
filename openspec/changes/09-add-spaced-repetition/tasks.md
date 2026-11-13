# Tasks

## 1. Data layer

- [ ] 1.1 Implement `src/lib/reviews.ts` (queue, rate, student progress, deck progress) and verify `npx tsc --noEmit` passes

## 2. Study session

- [ ] 2.1 Implement `/study` with the client session component (reveal, four ratings via Server Action, remaining counter, Again re-queue, refetch when empty, finish/empty screens); verify a full session against the API
- [ ] 2.2 Add keyboard shortcuts and rating error handling with retry; verify Space/1-4 work and a failed rating keeps the card

## 3. Counters and progress

- [ ] 3.1 Show due counts and Study buttons on the student `/decks` list and the home reminder; verify counts match the API
- [ ] 3.2 Show the per-student progress table on the teacher's deck page; verify with a deck proposed to two students

## 4. Integration

- [ ] 4.1 Run teacher proposes deck → student studies → teacher sees progress; confirm `npm run lint` and `npm run build` pass
