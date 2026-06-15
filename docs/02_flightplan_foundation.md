# FlightPlan Foundation Slice

## Objective of the FlightPlan slice

Introduce the first real operational record after Master Data: a `FlightPlan` foundation slice that allows teams to register, list, create, and update planned operations before map drawing, permit orchestration, and document packaging are added.

## Minimum schema/data needed

- `FlightPlan`
  - `id`
  - `code` or internal reference
  - `title`
  - `operationDate`
  - `status` (simple MVP lifecycle, not full permit lifecycle yet)
  - `notes`
  - `costCenterId` (required)
  - `clientId` (required)
  - `droneId` (required)
  - `operatorId` (required)
  - `createdAt`
  - `updatedAt`

Recommended MVP status set for this slice only:
- `DRAFT`
- `READY_FOR_GEOMETRY`
- `ON_HOLD`

Geometry payload should NOT be required yet in this slice.

## UI/routes to introduce first

- `src/app/flight-plans/page.tsx` — real list page
- `src/app/flight-plans/new/page.tsx` — create form
- `src/app/flight-plans/[id]/page.tsx` — edit/detail form
- `src/modules/flight-plans/flight-plan-form.tsx` — reusable simple form
- `src/server/flight-plans/queries.ts` — list/get queries
- `src/server/flight-plans/actions.ts` — create/update actions

The first form should only cover record identity, scheduled date, notes, and the required Master Data links.

## Dependencies on existing Master Data

This slice depends directly on the verified CRUD foundation already built for:

- `CostCenter`
- `Client`
- `Drone`
- `Operator`

The create/edit form must load active/selectable options from those modules.

## What to defer to later slices

- live map drawing
- GeoJSON storage fields with full geometry editing
- KML/DXF import/export
- permit state machine
- document attachments and package generation
- outbound communication / email registration
- hard delete and advanced audit history

## Acceptance checks before map integration

- `FlightPlan` schema slice exists and Prisma client regenerates cleanly
- list/create/edit routes build successfully
- create/update persist through Prisma actions
- form allows selecting existing cost center, client, drone, and operator
- pages fail gracefully when DB is unavailable
- `npm run typecheck`, `npm run prisma:generate`, and `npm run build` all pass
