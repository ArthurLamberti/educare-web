# Tasks

## 1. Data layer

- [x] 1.1 Update `src/lib/students.ts` types (`teacherId`, `teacherName`, `active`, `initialPassword`) and add `activateStudent`, list filters (`teacherId`, `includeInactive`); verify `npx tsc --noEmit` passes

## 2. Pages

- [x] 2.1 Update the list page: teacher column and filter for admins, "Show inactive" toggle, greyed inactive rows, created notice; verify as teacher and admin against the API
- [x] 2.2 Update the form: initial password on create (never echoed back), teacher selector for admins on create/edit; verify validation errors keep values except the password and an admin can reassign a teacher
- [x] 2.3 Replace the delete button with deactivate/reactivate (confirmation text per spec) and update Server Actions with `requireUser`; verify deactivation hides the student and reactivation restores it

## 3. Integration

- [x] 3.1 Run the flow: teacher creates student → student logs in on the subdomain and is forced to change password; confirm `npm run lint` and `npm run build` pass
