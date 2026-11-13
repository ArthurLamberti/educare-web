# Design

## Decisions

- **Client study component** fed with the initial queue by a Server Component; ratings go through a Server Action that returns the updated card schedule. Server Actions keep the token on the server; no API call from the browser.
- **In-session relearning**: cards rated Again (due in 10 min) are re-appended to the local queue; when the local queue empties, the component asks the server for a fresh queue once, which returns any card now due.
- **No next-interval hints on the buttons in v1**: showing "Good · 6d" would require duplicating the scheduling algorithm in TypeScript or an extra API call per card, and duplication risks drift from the API. Buttons show plain labels; the finish screen shows when the next card is due. Hints can be added later via a preview endpoint.
- **Keyboard shortcuts** (Space, 1-4) with visible hints; focus management for accessibility.
- **Counters** (home, decks list) read from `GET /api/reviews/progress` inside Suspense boundaries.

## Implementation notes

- "To review today" on the home page and the decks list is `dueToday + newToday` from `GET /api/reviews/progress`: what a study session would offer now (due reviews plus the new cards still allowed today).
- Cards rated Again go to the end of the local session (the API schedules them 10 minutes ahead); when the local queue empties, one fresh queue is fetched and the summary shows the API's `nextDueAt`.
- A failed rating keeps the card revealed with the error; pressing a rating again retries.
