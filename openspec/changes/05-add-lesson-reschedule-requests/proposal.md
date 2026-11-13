# Proposal

## Why

Students may ask to move a lesson if they ask at least 2 days before it, and the teacher approves or rejects (educare-api change 05). The web app needs the request form, the teacher's inbox and the status for both sides.

## What Changes

- Student: "Request new time" on an upcoming lesson, available only while it is 48h+ away (otherwise the button is disabled with an explanation showing the deadline); form with new date/time and reason; their requests with status; withdraw a pending request.
- Teacher: "Requests" inbox with pending count in the navigation; approve or reject (with optional note); conflicts shown clearly.
- Lesson items show a "Change requested" badge while a request is pending.

## Capabilities

### New Capabilities
- `reschedule-request-pages`: student request flow and teacher approval inbox.

### Modified Capabilities
None.

## Impact

- New `src/lib/reschedule-requests.ts`, `src/app/lessons/[id]/request-change/**`, `src/app/requests/**`; badge in lessons list; nav counter.
- Depends on educare-api change `05-add-lesson-reschedule-requests` and web change 04.
