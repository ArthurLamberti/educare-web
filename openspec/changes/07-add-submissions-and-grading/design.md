# Design

## Decisions

- **Reuse the Markdown component** from web change 06 for answers, previews and feedback.
- **Optimistic locking surfaced**: the grading form posts the submission `version`/`updatedAt` it displayed; a 409 shows "The student changed the answer - reload to review" instead of overwriting.
- **Unsaved answer protection**: a small client component warns on navigation away with unsaved changes (`beforeunload`); drafts are not stored server-side.
- **Counter** for "To grade" fetched inside the header Suspense boundary, like the requests counter.
