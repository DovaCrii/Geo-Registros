# FlightPlan Progress Notes

This document records the first real operational slice after Master Data.

## Status

- `FlightPlan` schema slice implemented
- Prisma-backed list/create/edit routes implemented
- required links to `CostCenter`, `Client`, `Drone`, and `Operator` implemented
- graceful DB-unavailable handling preserved
- `typecheck`, `prisma generate`, and `build` verified after implementation

## Files added or updated

- `prisma/schema.prisma`
- `src/server/clients/queries.ts`
- `src/server/drones/queries.ts`
- `src/server/operators/queries.ts`
- `src/server/flight-plans/queries.ts`
- `src/server/flight-plans/actions.ts`
- `src/modules/flight-plans/flight-plan-form.tsx`
- `src/app/flight-plans/page.tsx`
- `src/app/flight-plans/new/page.tsx`
- `src/app/flight-plans/[id]/page.tsx`
- `src/components/ui/page-shell.tsx`

## Scope preserved

- Geometry is not part of this slice yet
- GeoJSON remains the canonical target for the next slice
- KML/DXF import-export remains deferred
- Permit workflow remains deferred
- Document package generation remains deferred

## Recommended next step

Implement the geometry boundary slice:

1. define how a `FlightPlan` will hold GeoJSON or a related geometry record
2. add the first geometry placeholder flow in the flight-plan detail experience
3. only after that, move into real map tooling and editable shapes
