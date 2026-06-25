# 09 — KML / DXF Import & Export  2026-06-12

## Feature

Bidirectional KML and DXF file exchange in the interactive geometry editor, plus extended drawing modes (circle, delete-selection, undo, redo).

## Architecture

```
User clicks Import KML/DXF
  → File input (.kml/.kmz/.dxf)
  → File read as text
  → importKml() or importDxf() in geo-import.ts
  → GeoJSON FeatureCollection
  → Terra Draw addFeatures()
  → textarea updated

User clicks Export KML or Export DXF
  → Terra Draw getFeatures()
  → featuresToCleanGeoJson()
  → exportKml() or exportDxf() in geo-export.ts
  → Blob download

Terra Draw toolbar modes:
  - point, linestring, polygon, circle, select
  - delete-selection, undo, redo
```

## New files

| File | Purpose |
|------|---------|
| `src/lib/geo-import.ts` | KML → GeoJSON (via @tmcw/togeojson), DXF → GeoJSON (via dxf-parser) |
| `src/lib/geo-export.ts` | GeoJSON → KML (via tokml), GeoJSON → DXF (via dxf-writer) |
| `src/types/geo.d.ts` | Ambient `declare module 'tokml'` (untyped CJS library) |

## Modified files

| File | Changes |
|------|---------|
| `src/modules/flight-plans/geometry-editor.tsx` | 8 modes, import/export buttons, file input, download |
| `package.json` | +4 deps: @tmcw/togeojson, tokml, dxf-parser, dxf-writer |

## DXF entity support

| DXF entity | GeoJSON output | Notes |
|------------|---------------|-------|
| POINT | Point | |
| LINE | LineString (2 coords) | |
| LWPOLYLINE | Polygon (closed) or LineString (open) | Detects closed via `shape`, `closed`, or coordinate equality |
| POLYLINE | Same as LWPOLYLINE | |
| CIRCLE | Polygon (64-vertex approximation) | Cannot represent true circles in GeoJSON |
| ARC | LineString (32-segment approximation) | Start/end angles converted from degrees to radians |

Unsupported entities are silently skipped with a counter in the summary.

## GeoJSON → DXF entity mapping

| GeoJSON type | DXF output |
|-------------|------------|
| Point | drawPoint |
| MultiPoint | multiple drawPoint |
| LineString | drawPolyline (closed=false) |
| MultiLineString | multiple drawPolyline |
| Polygon | drawPolyline (closed=true, exterior ring only) |
| MultiPolygon | multiple drawPolyline (exterior ring each) |
| GeometryCollection | recursed |

Interior rings (holes) are omitted from DXF export because CAD polyline semantics do not universally support them.

## Test / verify

1. Open `/flight-plans/{id}/geometry`
2. Draw points, lines, polygons, circles with the toolbar
3. Click Export KML → open .kml in Google Earth or QGIS
4. Click Export DXF → open .dxf in AutoCAD / DraftSight / QGIS
5. Import a .kml or .dxf file → appears on the map and in the textarea
6. Undo / redo / delete-selection work as expected
