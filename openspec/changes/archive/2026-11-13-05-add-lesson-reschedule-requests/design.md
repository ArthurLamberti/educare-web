# Design

## Context

Web change 04 provides lesson pages and zone helpers. The API enforces the rule; the UI mirrors it for usability only.

## Decisions

- **Deadline computed for display** (`startsAt - 48h`, formatted in the school zone) with the server-side "now"; the API remains the authority (422 handled in the form).
- **One `/requests` route** adapting to role, like other pages.
- **Pending counter** in the nav fetched inside the existing `<Suspense>` header boundary (`GET /api/reschedule-requests?status=PENDING&size=1` → `totalElements`), so it does not block the page shell.
- **Reject note** via a small inline form per row (Server Action with `useActionState`) instead of a modal, keeping it server-driven and accessible.

## Implementation notes

- The "Change requested" badge comes from one call (`GET /api/reschedule-requests?status=PENDING&size=200`) mapped to lesson ids, instead of adding a field to the lesson API.
- The student action is hidden while a request is pending (the badge is shown instead); the request page also explains when a request is pending, too late or the lesson is canceled.
- Decided requests label the first time "Original time" (the lesson time when the request was made) and approved ones "Was / Moved to".
- Admins get a read-only `/requests` list; the pending counter is shown to teachers only.
