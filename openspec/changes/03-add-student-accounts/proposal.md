# Proposal

## Why

Students are now user accounts owned by a teacher (educare-api change 03): creating one requires an initial password, deleting deactivates, and admins see the whole school and can reassign teachers. The student pages must follow.

## What Changes

- Create form gains an "Initial password" field (and, for admins, a teacher selector); after creating, the teacher is reminded to give the student their password.
- The list shows a Teacher column for admins, a teacher filter for admins, and a "Show inactive" toggle; inactive students appear greyed out with a "Reactivate" action.
- "Delete" becomes "Deactivate", with a confirmation explaining the student loses access but keeps their history.
- Edit form lets admins change the teacher.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `student-pages`: list columns/filters by role, initial password on create, teacher selection for admins, deactivate/reactivate instead of delete.

## Impact

- `src/lib/students.ts` types and functions (`activateStudent`, filters); `src/app/students/**`, `student-form.tsx`, delete button replaced by a deactivate/reactivate button.
- Depends on educare-api change `03-add-student-accounts` and web change 02.
