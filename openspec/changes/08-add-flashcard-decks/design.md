# Design

## Decisions

- **Card editor as a client component** using Server Actions per operation (add/update/delete/reorder) and `useOptimistic` for snappy reordering; the server list is the source of truth after each action (`refresh()`).
- **Reorder with up/down buttons** instead of drag-and-drop: accessible by keyboard and no dependency; drag-and-drop can be added later.
- **Role-adaptive `/decks`** route; `/decks/{id}` shows the editor for the owner and the read-only browser for students.
