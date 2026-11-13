# Tasks

## 1. Data layer

- [ ] 1.1 Implement `src/lib/decks.ts` (decks, cards, reorder, deck students) and verify `npx tsc --noEmit` passes

## 2. Teacher

- [ ] 2.1 Implement `/decks` list, new/edit, archive/unarchive; verify against the API
- [ ] 2.2 Implement the card editor (add, inline edit, delete, up/down reorder with optimistic UI); verify order persists after reload and field errors show
- [ ] 2.3 Implement the deck students panel (propose, remove, hidden for archived decks); verify proposing to two students and removing one

## 3. Student

- [ ] 3.1 Implement the student `/decks` list and read-only deck page; verify a student sees only proposed decks

## 4. Integration

- [ ] 4.1 Add nav links per role and run teacher creates deck → adds cards → proposes → student sees it; confirm `npm run lint` and `npm run build` pass
