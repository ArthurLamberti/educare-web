# Design

## Decisions

- **Reuse the Markdown component** from web change 06 for answers, previews and feedback.
- **Optimistic locking surfaced**: the grading form posts the submission `version`/`updatedAt` it displayed; a 409 shows "The student changed the answer - reload to review" instead of overwriting.
- **Unsaved answer protection**: a small client component warns on navigation away with unsaved changes (`beforeunload`); drafts are not stored server-side.
- **Counter** for "To grade" fetched inside the header Suspense boundary, like the requests counter.

## Implementation notes

- The grading form sends the submission `version` it displayed. On 409 it shows a warning with "Reload"; after reloading (new version) the warning disappears and the typed score and feedback are kept.
- Saving a grade calls `refresh()` before redirecting to `/grading`, so the "To grade" counter in the layout updates too.
- The student page shows the instructions snapshot once submitted (what was answered), the current instructions before.
- The task page links submitted/graded work to its grading page ("Grade" / "Revise grade").
