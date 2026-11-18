# Spec Delta

## ADDED Requirements

### Requirement: Task level in pages
The task form SHALL offer an optional "Nível" select with the levels returned by the API, in their order. Task and assignment lists SHALL show the level code of each task that has one and SHALL offer a "Nível" filter.

#### Scenario: Pick a level
- **WHEN** a teacher creates a task choosing "B1"
- **THEN** the task appears in the library with a B1 badge and is found with the B1 filter
