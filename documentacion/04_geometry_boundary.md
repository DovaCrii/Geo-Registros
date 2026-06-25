# FlightPlan Geometry Boundary Slice

## Objective of the geometry slice

Attach a first real geometry boundary to `FlightPlan` so the record can persist a canonical GeoJSON payload and basic geometry metadata without introducing full interactive map editing yet.

## Minimum schema/data needed

- Add a nullable geometry payload field to `FlightPlan` for canonical GeoJSON storage.
- Add a small geometry status/summary layer sufficient for MVP traceability, for example:
  - geometry present / missing
  - geometry type summary
  - last updated timestamp via existing `updatedAt`
- Accept only bounded GeoJSON-safe content for this slice.

Recommended rule for this slice:
- geometry is optional
- when present, it must be valid JSON and shaped for future GeoJSON use

## UI/routes or components to introduce first

- extend `src/modules/flight-plans/flight-plan-form.tsx` or add a focused companion section for geometry payload entry
- extend `src/app/flight-plans/[id]/page.tsx` to display/edit geometry boundary information
- optionally expose a dedicated geometry section on the edit page rather than a whole new route
- add server-side validation/update logic under `src/server/flight-plans/...`

The first UI should be operational, not fancy:
- geometry presence indicator
- textarea or controlled field for canonical GeoJSON payload
- validation feedback

## What this slice proves technically

- `FlightPlan` can persist geometry-related data without depending on live map tooling
- the system can validate and reject malformed geometry payloads before persistence
- the operational record flow can move from plain planning data toward geospatial enrichment in a controlled way

## What to defer to the map-heavy slice

- MapLibre integration
- TerraDraw or similar drawing tooling
- interactive polygon/circle/pin editing
- geometry preview on a live map
- KML/DXF import/export
- measurement tools and screenshot capture

## Acceptance checks

- Prisma schema updates regenerate cleanly
- a `FlightPlan` can be updated with empty geometry or a valid geometry payload
- malformed geometry payload is rejected with clear feedback
- `typecheck`, `prisma:generate`, and `build` pass
- existing FlightPlan list/create/edit flow remains stable
