# Spec Delta

## Purpose

Lets students ask in the web app to move a lesson, within the 2-day rule, and lets teachers review and decide those requests.

## ADDED Requirements

### Requirement: Request a new time
The web app SHALL show students a "Request new time" action on each upcoming scheduled lesson. When the lesson starts in less than 48 hours, the action SHALL be disabled with the text "Changes must be requested at least 2 days before the lesson (deadline: <date time>)". The form at `/lessons/{id}/request-change` SHALL ask for new date, new time (school zone) and an optional reason.

#### Scenario: Within the rule
- **WHEN** a student opens a lesson 4 days away and submits a new time
- **THEN** the request is created and the lesson shows the "Change requested" badge

#### Scenario: Too late
- **WHEN** a lesson starts in 30 hours
- **THEN** the action is disabled and shows the deadline that has passed

#### Scenario: Server refuses
- **WHEN** the API responds 422 (e.g. the deadline passed while the form was open)
- **THEN** the form shows the API message

### Requirement: Student request status
The web app SHALL list a student's requests at `/requests` with lesson topic, current and proposed time, status (Pending, Approved, Rejected, Withdrawn, Canceled) and the teacher's note, and SHALL let them withdraw a pending request after confirmation.

#### Scenario: Rejected with note
- **WHEN** the teacher rejected a request with a note
- **THEN** the student sees status Rejected and the note

### Requirement: Teacher inbox
The web app SHALL show teachers a "Requests" navigation item with the number of pending requests, and a `/requests` page listing pending requests first (student, lesson, current and proposed time, reason) with Approve and Reject (optional note) actions, followed by decided ones.

#### Scenario: Approve
- **WHEN** the teacher approves a request
- **THEN** the request shows Approved and the lesson shows the new time

#### Scenario: Approve into conflict
- **WHEN** the API responds 409 on approval
- **THEN** the page shows the conflict message and the request stays pending
