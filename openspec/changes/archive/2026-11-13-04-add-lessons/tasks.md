# Tasks

## 1. Foundations

- [x] 1.1 Implement `src/lib/datetime.ts` (format in zone, zoned date+time → instant) and verify with a small test script covering a DST transition and a non-local zone
- [x] 1.2 Implement `src/lib/lessons.ts` (types and API functions) and verify `npx tsc --noEmit` passes

## 2. Pages

- [x] 2.1 Implement `/lessons` with Upcoming/Past/Canceled tabs, day grouping and role-specific columns/filters; verify as teacher, student and admin
- [x] 2.2 Implement `/lessons/new` and `/lessons/{id}/edit` forms and actions (with `requireUser(['TEACHER'])`); verify creation, field errors and overlap message
- [x] 2.3 Implement cancel with confirmation; verify the lesson moves to Canceled
- [x] 2.4 Add next-5-lessons widget to home for teachers and students and nav links; verify both roles

## 3. Integration

- [x] 3.1 With a browser set to a different time zone, schedule a lesson and confirm it shows at the entered school time; confirm `npm run lint` and `npm run build` pass
