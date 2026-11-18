# Proposal: No duplicate flashcards (pages)

## Why
Show the duplicate rules added by educare-api change 14.

## What Changes
- Adding or editing a card whose front the student already has shows "Essa palavra já está nos flashcards do aluno".
- The bulk card form adds the other cards and shows "N cartas já existiam e foram ignoradas: ..." (the skipped fronts).
- "Enviar para os flashcards" in the lesson words shows the same notice for skipped words.

## Impact
- Depends on educare-api change 14-prevent-duplicate-flashcards.
