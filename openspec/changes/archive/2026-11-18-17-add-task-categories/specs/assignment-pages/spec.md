# Spec Delta

## ADDED Requirements

### Requirement: Task categories in pages
A teacher SHALL manage their categories on a page that lists each with the number of tasks using it and allows creating, renaming and deleting them; a duplicate name SHALL show "Já existe uma categoria com esse nome". The task form SHALL offer an optional "Categoria" select with the teacher's categories and a way to create one without leaving the form. Task and assignment lists SHALL show each task's category and offer a "Categoria" filter.

#### Scenario: New category from the task form
- **WHEN** a teacher creates the category "Listening" from the task form
- **THEN** it is selected in the form and listed on the categories page
