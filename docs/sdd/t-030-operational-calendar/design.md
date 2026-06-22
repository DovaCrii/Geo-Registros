# SDD Design: T-030 — Operational Calendar

## Approach

Build a lightweight agenda view grouped by day, using `FlightPlan.operationDate` as the only required date primitive.

## Proposed structure

1. Query flight plans ordered by `operationDate`.
2. Group them by local day.
3. Render a compact agenda/calendar-like component.
4. Reuse existing timeline/card styles for consistency.

## Integration points

- Dashboard data query for upcoming flight plans.
- Operational dashboard or a dedicated calendar page.
- Shared date formatting utilities.

## Design decisions

- No external calendar dependency.
- Agenda first, grid only if truly needed later.
- Keep rescheduling out of scope.

## Risks

- A full calendar grid could add complexity without much value.
- Date grouping must be consistent with locale/timezone handling.
