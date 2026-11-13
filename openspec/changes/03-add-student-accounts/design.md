# Design

## Context

Web change 02 provides `requireUser` with the role, and the student pages follow the list/form/action pattern. The API now returns `teacherId`, `teacherName`, `active` and accepts `initialPassword`, `teacherId`, `includeInactive`.

## Goals / Non-Goals

**Goals:** one set of pages adapting to the role; no password ever re-rendered.
**Non-Goals:** bulk import, password reset for students by the teacher (could be a later change).

## Decisions

- **Role-adaptive pages** instead of separate admin/teacher routes: the page reads the user's role and renders the extra column/filter/selector. Fewer routes, and the API already scopes the data.
- **Filters in the URL** (`?teacherId=&inactive=1&page=`), so they survive reload and navigation (Server Component reads `searchParams`).
- **Teacher selector** loads active teachers from `GET /api/teachers` (admins only).
- **Created notice** via a `?created=1` query param after redirect, rendered by the list page, rather than client state that would be lost on redirect.
- **Password never echoed**: the form action's returned `values` omit `initialPassword`, so a failed submit empties that field.
