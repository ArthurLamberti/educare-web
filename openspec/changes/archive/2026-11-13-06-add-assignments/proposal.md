# Proposal

## Why

Teachers need to write tasks once and assign them to their students; students need a to-do list of what they must do and by when (educare-api change 06).

## What Changes

- Teacher "Tasks" library: list with search and archived toggle, create/edit (title, instructions in Markdown with preview), archive/unarchive, delete when unused.
- Assign a task to one or more students with an optional due date; see who it is assigned to and unassign untouched work.
- Teacher "Assignments" overview filterable by student and status.
- Student "My assignments": pending (soonest due first, overdue highlighted) and completed lists; detail page with instructions.

## Capabilities

### New Capabilities
- `assignment-pages`: task library, assigning, and the student's assignments list.

### Modified Capabilities
None.

## Impact

- New `src/lib/tasks.ts`, `src/lib/assignments.ts`, `src/app/tasks/**`, `src/app/assignments/**`, a safe Markdown renderer component.
- New dependency for Markdown rendering (e.g. `react-markdown`, no raw HTML).
- Depends on educare-api change `06-add-assignments`.
