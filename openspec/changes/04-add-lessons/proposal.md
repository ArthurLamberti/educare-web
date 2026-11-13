# Proposal

## Why

Teachers need to schedule and manage lessons with their students, and students need to see when their next lessons are (educare-api change 04).

## What Changes

- Teacher "Lessons" area: upcoming lessons list (with past and canceled views), create/edit form (student, date, time, duration, topic, notes), change time, cancel with confirmation.
- Student "My lessons" area: upcoming and past lessons, read-only.
- Admin: read-only list of all lessons of the school, filterable by teacher and student.
- All dates and times are shown and entered in the school's time zone.
- Home page shows the next lessons for teachers and students.

## Capabilities

### New Capabilities
- `lesson-pages`: pages to schedule, view, reschedule and cancel lessons by role.

### Modified Capabilities
None.

## Impact

- New `src/lib/lessons.ts`, `src/lib/datetime.ts` (zone conversion), `src/app/lessons/**`, home page widgets, nav links per role.
- Depends on educare-api change `04-add-lessons`.
