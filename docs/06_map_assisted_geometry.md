# Map-Assisted Geometry Editor Slice

## Objective of the slice

Introduce a dedicated `FlightPlan` geometry page that renders the current canonical GeoJSON on a 2D map and allows controlled editing/saving without turning the product into a full geospatial workstation yet.

## Minimum technical additions

- add minimal map runtime dependencies for 2D rendering
- add a dedicated geometry editor route scoped to a single `FlightPlan`
- load existing `geometryJson` from the selected flight plan
- provide a bounded editing interaction that can replace/update the stored GeoJSON
- persist the updated canonical GeoJSON back through the existing `FlightPlan` persistence path

## UI/routes/components to introduce

- `src/app/flight-plans/[id]/geometry/page.tsx` — dedicated geometry workspace for one flight plan
- `src/modules/flight-plans/geometry-editor.tsx` — bounded client component for map rendering/edit/save
- minimal server action or update path extension to persist geometry edits cleanly

The existing form-based JSON textarea remains valid as fallback, but this slice should become the primary operator-facing geometry workflow.

## What this slice proves

- the app can render stored GeoJSON on a real 2D map
- a `FlightPlan` can round-trip between persisted GeoJSON and a map-assisted editing experience
- the architecture can support map tooling without collapsing the MVP into full geospatial complexity

## What must remain deferred

- KML/DXF import/export
- advanced drawing toolbox
- measurements and area/radius calculations
- screenshot capture
- multi-layer geospatial management
- permit/document integration

## Acceptance checks

- map page builds and loads within the existing App Router structure
- an existing `FlightPlan` with geometry can render that geometry on the map
- edited geometry can be saved back to the same `FlightPlan`
- a `FlightPlan` with no geometry can still open the page safely
- invalid persistence attempts fail cleanly
- `npm run prisma:generate`, `npm run typecheck`, and `npm run build` pass after implementation
