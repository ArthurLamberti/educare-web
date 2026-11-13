# Tasks

## 1. Data layer

- [ ] 1.1 Implement `src/lib/tasks.ts` and `src/lib/assignments.ts` and verify `npx tsc --noEmit` passes
- [ ] 1.2 Add `react-markdown` and a `Markdown` component without raw HTML; verify a sample with `<script>` renders as text

## 2. Teacher pages

- [ ] 2.1 Implement `/tasks` list (search, archived toggle), new/edit with preview, archive/unarchive/delete rules; verify against the API
- [ ] 2.2 Implement the assign form and task assignment list with unassign on the task page; verify assigning to two students, 409 message, and unassign
- [ ] 2.3 Implement the teacher `/assignments` overview with filters; verify filtering by student and status

## 3. Student pages

- [ ] 3.1 Implement the student `/assignments` list (pending first, overdue highlight) and `/assignments/{id}` detail; verify ordering and overdue highlighting

## 4. Integration

- [ ] 4.1 Run teacher creates task → assigns → student sees it; add nav links per role; confirm `npm run lint` and `npm run build` pass
