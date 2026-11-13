# Tasks

## 1. Data layer

- [ ] 1.1 Implement `src/lib/reschedule-requests.ts` (types, create, list, withdraw, approve, reject) and verify `npx tsc --noEmit` passes

## 2. Student flow

- [ ] 2.1 Add the "Request new time" action with deadline logic and the `/lessons/{id}/request-change` form; verify a request 4 days ahead succeeds, a lesson 30h away shows the disabled action, and a 422 is shown in the form
- [ ] 2.2 Implement the student `/requests` list with withdraw and the "Change requested" badge on lessons; verify withdraw and badge appear/disappear

## 3. Teacher flow

- [ ] 3.1 Implement the teacher `/requests` inbox with approve and reject-with-note, and the nav pending counter; verify approve moves the lesson, conflict 409 keeps it pending, and the counter updates

## 4. Integration

- [ ] 4.1 Run the student → teacher flow end to end with both apps; confirm `npm run lint` and `npm run build` pass
