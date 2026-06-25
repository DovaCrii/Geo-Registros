# Geometry Boundary Progress

This document records the first real geometry boundary attached to `FlightPlan`.

## Implemented

- `FlightPlan` now supports optional geometry persistence through:
  - `geometryJson Json?`
  - `geometryType String?`
- create/update actions validate incoming GeoJSON-shaped payloads server-side
- empty payloads are normalized safely through Prisma JSON-null handling
- list and edit flows now expose geometry presence/type without requiring live map tooling

## Validation boundary

Accepted top-level GeoJSON types in this slice:

- `Point`
- `MultiPoint`
- `LineString`
- `MultiLineString`
- `Polygon`
- `MultiPolygon`
- `GeometryCollection`
- `Feature`
- `FeatureCollection`

Rejected in this slice:

- malformed JSON
- primitive/non-object payloads
- unsupported top-level types

## Scope preserved

- no interactive map editor yet
- no KML/DXF import/export yet
- no measurements or screenshot tooling yet
- no geometry drawing UX yet

## Technical note

After Prisma schema changes, `prisma generate` must run before `typecheck` or TypeScript will fail to see new enums/model fields.

## Recommended next slice

Move to a **map-assisted geometry editor boundary**:

1. introduce a dedicated flight-plan geometry page or panel
2. render an initial 2D map view without full tool suite
3. load/save canonical GeoJSON from the current `FlightPlan` record
4. keep KML/DXF, measurements, and advanced editing deferred until the map slice stabilizes
