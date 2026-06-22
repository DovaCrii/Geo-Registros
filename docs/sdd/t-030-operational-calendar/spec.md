# SDD Spec: T-030 — Operational Calendar

## Functional requirements

### R1 — Date grouping
- The system must group flight plans by `operationDate`.
- Missing or invalid dates must not crash the view.

### R2 — Calendar/agenda view
- The UI must present a lightweight operational calendar or agenda view.
- The view must make upcoming plans easy to scan.

### R3 — Reuse existing patterns
- The implementation should reuse current dashboard/timeline styling patterns when practical.

## Non-functional requirements

- Simple implementation.
- Fast initial load.
- Minimal new dependencies.
- Clear date formatting.

## Acceptance criteria

- [ ] Flight plans appear grouped by operation date.
- [ ] Future operational load is visible at a glance.
- [ ] The view works without a third-party calendar package.
- [ ] Invalid or missing dates are handled safely.

## Assumptions

- `FlightPlan.operationDate` is the primary date source.
- A first slice can be an agenda-style grouped list if that is simpler than a full calendar grid.
