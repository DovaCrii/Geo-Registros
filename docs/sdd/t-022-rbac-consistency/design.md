# SDD Design: T-022 — RBAC Consistency Audit

## Approach

Use the existing auth/permission helpers as the source of truth and patch the smallest set of flight plan detail surfaces where UI and server enforcement may diverge.

## Design principles

- Do not add a new auth layer.
- Prefer explicit permission checks at mutation boundaries.
- Hide or disable controls in the UI when the server would reject them.
- Keep permission logic centralized in `src/lib/authorize.ts`.

## Likely integration points

- `src/app/flight-plans/[id]/page.tsx`
- flight plan mutation actions in `src/server/flight-plans/`
- any visible transition controls tied to permission updates

## Risks

- UI-only gating without server checks would still be insecure.
- Scattered permission rules can drift over time.
- Over-broad refactors can create unnecessary risk.

## Verification approach

- Run existing tests.
- Add focused tests around permission-sensitive helpers if new logic is extracted.
- Validate typecheck and build after changes.
