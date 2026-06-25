# Interactive geometry editing — Progress

## What was done

Integrated Terra Draw (`@watergis/maplibre-gl-terradraw` v1.13.2) as the primary map-based geometry editor for flight plans.

### Changes

**`src/modules/flight-plans/geometry-editor.tsx`** — replaced the old custom MapLibre source/layer approach with `MaplibreTerradrawControl`:

- Removed `map.addSource("flight-plan-geometry", ...)` + three layers (fill, line, point)
- Added `MaplibreTerradrawControl` with modes: `point`, `linestring`, `polygon`, `select`
- Loads existing GeoJSON from the flight plan into Terra Draw on initialisation
- Automatic sync from Terra Draw → textarea on mode change and feature deletion
- New "Apply from textarea" button to push manually edited GeoJSON back to the map
- New `fitMapToPoints()` helper using bounds from extracted coordinates
- Kept existing form-based save mechanism (reads textarea → `updateFlightPlanGeometry` server action)

### Architecture decisions

| Decision | Rationale |
|---|---|
| Terra Draw replaces custom MapLibre layers | Single renderer, no visual overlap or sync issues |
| Modes: point, linestring, polygon, select | Covers MVP geometry types; rectangle/circle/freehand deferred |
| Sync: only on `mode-changed` + `feature-deleted` | Avoids rapid-fire updates; user can also use "Apply from textarea" |
| `addFeatures` via `control.getTerraDrawInstance()` | MaplibreTerradrawControl wraps TerraDraw internally |
| Multi* geometry types cast through `any` | Terra Draw's `GeoJSONStoreGeometries` only accepts Point/LineString/Polygon |

### Sync behaviour

| Action | Effect |
|---|---|
| Draw a feature on map | Feature visible immediately on map. Textarea syncs when user switches mode OR deletes a feature. |
| Delete a feature | Textarea updates immediately with remaining features (or empties). |
| Edit GeoJSON in textarea | Map does NOT auto-update. Click **Apply from textarea** to push changes to Terra Draw. |
| Click **Save geometry** | Textarea content is persisted to the database via existing server action. |

### Build verification

- `npm run prisma:generate` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

### Next steps / deferred

- KML/DXF import/export
- Full multi-geometry support (MultiPoint, MultiLineString, MultiPolygon)
- Drawing tools: rectangle, circle, freehand via Terra Draw
- Terrain/elevation profiles
- Permit and document orchestration
