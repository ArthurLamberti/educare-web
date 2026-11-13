# Spec Delta

## Purpose

Gives school admins web pages to manage their school's teacher accounts.

## ADDED Requirements

### Requirement: Teacher list
The web app SHALL show admins the school's teachers at `/teachers` (name, email, status active/inactive), paginated, with links to edit and actions to deactivate or reactivate.

#### Scenario: Admin lists teachers
- **WHEN** an admin opens `/teachers`
- **THEN** a table with the school's teachers and their status is shown

### Requirement: Create and edit teacher
The web app SHALL provide `/teachers/new` (name, email, initial password) and `/teachers/{id}/edit` (name, email) forms that show API field errors and return to `/teachers` on success. After creating, the page SHALL remind the admin to share the initial password with the teacher.

#### Scenario: Duplicate email
- **WHEN** the API responds 409 on creation
- **THEN** the form shows the API message and keeps the typed values

### Requirement: Deactivate and reactivate
The web app SHALL ask for confirmation before deactivating a teacher, then update the list.

#### Scenario: Deactivate
- **WHEN** the admin confirms deactivation
- **THEN** the teacher shows as inactive and the action changes to "Reactivate"
