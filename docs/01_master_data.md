# Master Data Notes

This document records the first real Block 2 implementation slice for Geo-Registros.

## Status

- `CostCenter` CRUD slice implemented and build-verified
- `Client` CRUD slice implemented and build-verified
- `Drone` CRUD slice implemented and build-verified
- `Operator` CRUD slice implemented and build-verified

## Real implementation pattern

- App Router pages under `src/app/...`
- Prisma-backed server queries/actions under `src/server/...`
- Simple reusable forms under `src/modules/...`
- Dynamic pages use graceful database-unavailable fallbacks
- `typecheck`, `prisma generate`, and `build` pass after each slice

## Scope decisions preserved

- `Drone` is not bound to `Operator` yet
- `Operator` keeps optional `costCenterId`
- Hard delete remains deferred
- Advanced certification and license workflows remain deferred
- Filter bars are visual foundation only for now

## Files added by Block 2 slices

### Cost centers
- `src/lib/prisma.ts`
- `src/server/cost-centers/actions.ts`
- `src/server/cost-centers/queries.ts`
- `src/modules/cost-centers/cost-center-form.tsx`
- `src/app/cost-centers/page.tsx`
- `src/app/cost-centers/new/page.tsx`
- `src/app/cost-centers/[id]/page.tsx`

### Clients
- `src/server/clients/actions.ts`
- `src/server/clients/queries.ts`
- `src/modules/clients/client-form.tsx`
- `src/app/clients/page.tsx`
- `src/app/clients/new/page.tsx`
- `src/app/clients/[id]/page.tsx`

### Drones
- `src/server/drones/actions.ts`
- `src/server/drones/queries.ts`
- `src/modules/drones/drone-form.tsx`
- `src/app/drones/page.tsx`
- `src/app/drones/new/page.tsx`
- `src/app/drones/[id]/page.tsx`
- extension to `src/server/cost-centers/queries.ts` for active cost center options

### Operators
- `src/server/operators/actions.ts`
- `src/server/operators/queries.ts`
- `src/modules/operators/operator-form.tsx`
- `src/app/operators/page.tsx`
- `src/app/operators/new/page.tsx`
- `src/app/operators/[id]/page.tsx`

## Recommended next block

Move to the first operational block after Master Data:

1. Define `FlightPlan` MVP schema slice
2. Add flight-plan list/create/edit structure
3. Prepare map module integration boundary without overcommitting to full geospatial tooling in one pass
4. Keep geometry persistence canonical in GeoJSON
5. Leave permit workflow and document package orchestration for the following operational slice
