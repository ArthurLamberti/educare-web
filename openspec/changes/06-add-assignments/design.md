# Design

## Decisions

- **Markdown rendering** with `react-markdown` (no `rehype-raw`), rendered in Server Components so no extra client JS; the editor preview is a client component using the same renderer. Raw HTML is never enabled, preventing XSS from instructions.
- **Student selection** as a checkbox list of the teacher's active students (fetched server-side); fine for tutoring-sized rosters. Search-select can come later if rosters grow.
- **Due date input** reuses the date + time inputs and zone helper from web change 04; empty means no due date.
- **Role-adaptive `/assignments`** route; detail at `/assignments/{id}` is extended by change 07 with answer and grade.
