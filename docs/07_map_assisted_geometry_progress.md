# Map-Assisted Geometry Progress

This document closes the first real map-assisted geometry slice for Geo-Registros.

## Status

- Dedicated map-assisted geometry page implemented and build-verified
- Existing canonical GeoJSON loads from `FlightPlan.geometryJson`
- Geometry preview renders on a real 2D MapLibre map
- Geometry can be edited in a controlled textarea-backed workflow
- Geometry-only persistence path exists through a dedicated server action

## Real implementation added

- `maplibre-gl` runtime dependency added to `package.json`
- global MapLibre CSS imported in `src/app/layout.tsx`
- `src/modules/flight-plans/geometry-editor.tsx`
- `src/app/flight-plans/[id]/geometry/page.tsx`
- `updateFlightPlanGeometry(id, formData)` added to `src/server/flight-plans/actions.ts`
- `src/app/flight-plans/[id]/page.tsx` now links to the dedicated geometry page
- `src/app/flight-plans/page.tsx` now exposes a geometry action per row

## What this slice proves

- A stored canonical GeoJSON payload can be rendered on a real 2D map
- The same payload can be updated and saved back to the same `FlightPlan`
- Build safety remains intact even when the DB is not reachable at runtime
- The geometry path is now stronger than raw textarea-only editing without turning the app into a full GIS workstation

## Technical lessons preserved

- After Prisma schema changes, run `prisma generate` before `typecheck`
- Prisma JSON nullability for optional geometry uses `Prisma.DbNull` and `Prisma.InputJsonValue`
- MapLibre typing can require small option adjustments; in this slice, removing `attributionControl: true` resolved the TypeScript issue cleanly

## Scope deliberately deferred

- interactive drawing toolbox
- KML/DXF import/export
- measurements
- screenshot capture
- multi-layer management
- permit/document integration from the geometry page

## Recommended next step

Move to a bounded interactive geometry editing slice:

1. introduce one controlled edit mode on the map for the existing payload
2. keep persistence on the same `FlightPlan.geometryJson`
3. avoid importing KML/DXF or adding full workstation behavior yet
