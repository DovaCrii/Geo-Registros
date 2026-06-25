# SDD Proposal: Geometría / Mapa Satelital / KMZ

## Situación actual

El editor de geometría (`/flight-plans/[id]/geometry`) ya tiene:
- MapLibre GL con tiles genéricos (`demotiles.maplibre.org`)
- Terra Draw: dibujar puntos, líneas, polígonos, círculos
- Importar KML/DXF funcional
- Exportar KML/DXF funcional
- Editor GeoJSON raw
- Guardar geometría en `FlightPlan.geometryJson`

## Problemas

1. **Tiles genéricos** — el mapa base no es satelital, no sirve para contexto geográfico real
2. **KMZ roto** — `importKml` espera KML, KMZ está stubbed ("KMZ próximamente")
3. **Toolbar embebida** — los controles de dibujo están en la esquina del map control, no hay una barra de herramientas visual dedicada

## Scope (IN)

- **Tile layer satelital**: cambiar style URL a ESRI World Imagery o similar gratuito
- **KMZ real**: descompresión ZIP + extracción KML + parseo con `importKml`
- **Barra de herramientas**: toolbar dedicado arriba del mapa con botones visibles para cada herramienta de dibujo, import, export
- **Preview satelital**: asegurar que el mapa muestre el contexto satelital con la geometría superpuesta

## Scope (OUT)

- No cambiar el sistema de almacenamiento (sigue siendo GeoJSON en Prisma)
- No agregar edición de vértices drag (Terra Draw ya lo maneja)
- No agregar medición de áreas/distancias
- No cambiar la página de detalle del plan (es el siguiente SDD)

## Dependencias actuales

- `maplibre-gl` (v4+)
- `@watergis/maplibre-gl-terradraw`
- `importKml/importDxf` en `@/lib/geo-import`
- `exportKml/exportDxf` en `@/lib/geo-export`

Para KMZ: `jszip` (nueva dependencia, liviana ~5KB gzip)

## Archivos a tocar

| Archivo | Cambio |
|---|---|
| `src/modules/flight-plans/geometry-editor.tsx` | Tile satelital, toolbar dedicado, KMZ handler |
| `src/lib/geo-import.ts` | Agregar `importKmz()` que descomprime y delega a `importKml()` |
| `package.json` | Agregar `jszip` |

## Esfuerzo estimado

- Tile satelital: ~15 min (cambio de URL)
- KMZ: ~1h (jszip + parse)
- Toolbar: ~2h (reorganizar UI)
- Total: ~3-4h
