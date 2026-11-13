# Design

## Decisions

- **Card editor as a client component** using Server Actions per operation (add/update/delete/reorder) and `useOptimistic` for snappy reordering; the server list is the source of truth after each action (`refresh()`).
- **Reorder with up/down buttons** instead of drag-and-drop: accessible by keyboard and no dependency; drag-and-drop can be added later.
- **Role-adaptive `/decks`** route; `/decks/{id}` shows the editor for the owner and the read-only browser for students.

## Implementation notes

- `useOptimistic` covers reorder and delete; the server list replaces it after `refresh()`. Inline edit and the add form use `useActionState` and keep typed values on errors.
- The deck page proposes to the teacher's active students who do not have the deck yet; removing asks for confirmation and says the progress is kept.
- Admins can read all decks at `/decks` (with a Teacher column), read-only, like assignments.
