# SDD Spec: T-022 — RBAC Consistency Audit

## Functional requirements

### R1 — UI visibility matches permissions
- Flight plan detail actions must be visible only when the user has the required role/permission.
- Disabled or hidden controls must not suggest access the server would deny.

### R2 — Server-side enforcement
- All flight plan mutation entry points must call explicit permission checks before mutating data.
- If the user lacks permission, the request must fail safely.

### R3 — Consistent flight plan detail flow
- The detail page, its edit controls, and related transition actions must behave consistently across roles.

## Non-functional requirements

- Security: unauthorized access must be denied at the server.
- Consistency: UI and server behavior must match.
- Maintainability: permission checks should reuse existing helpers, not duplicate logic.

## Acceptance criteria

- [ ] Unauthorized users do not see mutation controls they cannot use.
- [ ] Authorized users still see and use the expected controls.
- [ ] Mutation entry points reject unauthorized requests server-side.
- [ ] Existing permission helpers remain the single source of truth.

## Out of scope

- Reworking the RBAC model itself.
- Permissions for unrelated modules.
- Broad UI redesigns.

## Assumptions

- `authorize.ts` remains the canonical permission map.
- `require-page-auth.ts` remains the page-level auth guard.

## Open questions

- Which flight plan detail actions are currently visible but not explicitly checked?
- Are there any mutation paths outside the detail page that should be included in the same slice?
