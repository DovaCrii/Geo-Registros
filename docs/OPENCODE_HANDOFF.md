# OpenCode Handoff — AeroFlow Pending Gaps

## Preflight
- Pace: `auto`
- Artifacts: `openspec`
- PR strategy: `ask-always`
- Review budget: `400` changed lines

## Goal
Close the remaining product gaps in a safe order, keeping each step verifiable and avoiding regressions in existing flows.

## Execution Order
1. Flight plan geometry editor: polygon selection, delete, save/persist sync.
2. DGAC help docs form warning: remove invalid `encType` usage.
3. Authorization policy: server-side permissions for admin vs operator roles.
4. User/account management hardening: last-admin safeguards and clearer user admin UX.
5. Home button / return-to-dashboard action in the shell.
6. Visual UX polish for home/help content.

## Phase Details

### 1) Flight plans: polygons, delete, save
- Make TerraDraw + `geometryPayload` sync through a single source of truth.
- Delete only the selected shape; show a clear message if nothing is selected.
- Keep "Save area of operation" enabled only when the GeoJSON is valid.
- After save, reload `/flight-plans/[id]/geometry` and show persisted geometry.

### 2) DGAC help docs warning
- Remove `encType="multipart/form-data"` from the server-action form.
- Do not add `method`; Next manages it.

### 3) Permissions: admin vs operator
- `ADMIN`: full access.
- `OPERADOR_RPA`: can create/edit/view flight plans, upload/view operational documents, export reports.
- `OPERADOR_RPA`: cannot delete or manage master data, users, or admin docs.
- Enforce this in server actions, not only in UI.

### 4) Account management and profile
- Use `/admin/users` as the central account management screen.
- Prevent disabling the last active admin or changing the last admin to another role.
- Make the current user/admin access path more obvious from the shell.

### 5) Clear return-to-home action
- Add a secondary but visible “Home/Dashboard” action in `PageShell`.
- Keep it visually subordinate to primary actions.

### 6) Visual UX polish
- Improve the “Solution” section on the landing page.
- Increase type size and clarity in the step cards.
- Make CTA labels explicit where icons are ambiguous.
- Improve image sizing so content reads clearly on desktop and mobile.

## Validation
- Run the smallest meaningful validation after each phase.
- Final gate: `npm run typecheck`, `npm run test`, `npm run build`.

## Constraints
- Avoid unnecessary database changes.
- Do not mix large refactors with functional fixes.
- Keep technical artifacts in English.
