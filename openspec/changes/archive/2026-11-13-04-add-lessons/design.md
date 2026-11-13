# Design

## Context

The API exchanges UTC instants; `GET /api/auth/me` (via `getCurrentUser`) provides `tenant.timeZone`. Server Components render lists; forms use Server Actions.

## Goals / Non-Goals

**Goals:** correct time-zone handling on the server, independent of browser and server zones.
**Non-Goals:** calendar (week/month grid) view, drag-and-drop rescheduling, `.ics` export.

## Decisions

- **Zone conversion on the server** with `Intl.DateTimeFormat` for display and a small `zonedTimeToInstant(date, time, zone)` helper for input, in `src/lib/datetime.ts`. Considered `date-fns-tz`/Temporal: `Intl` covers display; the input conversion is a few lines with an offset lookup and unit tests for DST boundaries. If the project's Node supports `Temporal`, prefer it (check at implementation).
- **Form inputs**: `<input type="date">` + `<input type="time">` + duration `<select>`; values are plain strings interpreted in the school zone by the Server Action. Avoids `datetime-local`, whose value the browser ties to the local zone in user perception.
- **Tabs via `?view=upcoming|past|canceled`** mapped to API filters (`from`/`to`/`status`), keeping lists server-rendered and linkable.
- **Role-adaptive single route** (`/lessons`) like the student pages.

## Implementation notes

- Node 22 has no `Temporal`, so `src/lib/datetime.ts` uses `Intl` only. `zonedDateTimeToInstant` applies the zone offset twice (for DST changes between guess and result) and returns `null` for times skipped by DST, which the form reports as a `startsAt` error; ambiguous times (DST fall-back) resolve to the first occurrence. Checked with a script for São Paulo, Lisbon (summer/winter), New York on both 2026 DST days, Kolkata and invalid dates, under process zones UTC, Lisbon and Tokyo.
- Conversion happens only in Server Components and Server Actions, so the browser zone never takes part. The integration check ran the Next server with `TZ=Asia/Tokyo` and a browser in São Paulo: 14:00 entered was stored as 17:00Z and displayed as 14:00.
- Past lessons = `SCHEDULED` with `startsAt < now` (no "done" status yet); Edit/Cancel only appear on the Upcoming tab.
