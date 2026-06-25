# SDD Design: Geometría / Mapa Satelital / KMZ

## 1. Mapa satelital

**Cambio**: Reemplazar el style URL de MapLibre por un raster tile layer satelital.

```typescript
// Antes
const map = new maplibregl.Map({
  container: containerRef.current,
  style: "https://demotiles.maplibre.org/style.json",
  center: [-70.6693, -33.4489],
  zoom: 4,
});

// Después — ESRI World Imagery via raster tiles
const map = new maplibregl.Map({
  container: containerRef.current,
  style: {
    version: 8,
    sources: {
      satellite: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution:
          "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      },
    },
    layers: [
      {
        id: "satellite-layer",
        type: "raster",
        source: "satellite",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
  center: [-70.6693, -33.4489],
  zoom: 4,
});
```

## 2. KMZ import

**Flujo**:
```
KMZ file → JSZip.unzip() → buscar archivo .kml → extraer texto → importKml(text)
```

**Caso borde**: KMZ puede contener múltiples archivos. Buscar `doc.kml` primero, si no existe, el primer `.kml` en la jerarquía.

```typescript
// src/lib/geo-import.ts — nuevo export
export async function importKmz(arrayBuffer: ArrayBuffer): Promise<ImportResult> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Buscar doc.kml o el primer .kml
  const kmlEntry = zip.file(/\.kml$/i)?.[0];
  // ... o buscar doc.kml primero
  if (!kmlEntry) throw new Error("No KML file found inside KMZ archive.");
  
  const text = await kmlEntry.async("string");
  return importKml(text);
}
```

## 3. Barra de herramientas dedicada

**Estructura UI**:

```
┌──────────────────────────────────────────────────────────┐
│ [Mapa y geometría asistida]              [StatusChip]    │
├──────────────────────────────────────────────────────────┤
│ [Punto] [Línea] [Polígono] [Círculo] | [Seleccionar]    │
│ [↩ Deshacer] [↪ Rehacer] [🗑 Borrar] | [📂 KML/KMZ/DXF] │
├──────────────────────────────────────────────────────────┤
│                    Mapa (satelital)                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Implementación**:
- Eliminar `MaplibreTerradrawControl` del mapa (addControl)
- Control manual de Terra Draw via botones que cambian el modo
- Botones con estado activo (clase CSS `bg-cyan-500/20` cuando está seleccionado)
- File input hidden para KML/KMZ/DXF

## Orden de implementación

1. Instalar `jszip`
2. Agregar `importKmz()` en geo-import.ts
3. Cambiar tile layer a satelital en geometry-editor.tsx
4. Crear toolbar reemplazando TerraDraw control embebido
5. Integrar KMZ handler en el file input
