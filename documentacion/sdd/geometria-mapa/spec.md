# SDD Spec: Geometría / Mapa Satelital / KMZ

## Requisitos

### R1 — Mapa satelital
- Reemplazar `https://demotiles.maplibre.org/style.json` por un tile layer satelital
- Opción gratuita: ESRI World Imagery (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`) vía raster tile layer
- Mantener el mismo comportamiento del mapa (zoom, navegación, Terra Draw)

### R2 — KMZ real
- Agregar `importKmz()` en `geo-import.ts` que:
  1. Descomprima el archivo KMZ (ZIP con KML dentro)
  2. Extraiga el archivo `.kml` (doc.kml o el primero que encuentre)
  3. Parsee el KML con el mismo `importKml()` existente
- Agregar `jszip` como dependencia

### R3 — Barra de herramientas dedicada
- Mover los controles de dibujo de la esquina del mapa a una toolbar horizontal arriba del mapa
- Toolbar con botones visibles: punto, línea, polígono, círculo, seleccionar, borrar, deshacer, rehacer
- Separar controles de import/export (KML, DXF) en la toolbar también
- Indicador visual del modo activo

## Criterios de Aceptación

- [ ] El mapa base muestra imágenes satelitales (no el tile genérico)
- [ ] Cargar un archivo `.kmz` con un KML válido importa la geometría correctamente
- [ ] Cargar un `.kmz` sin KML interno muestra error
- [ ] La barra de herramientas reemplaza al control embebido de Terra Draw
- [ ] El botón del modo activo se resalta visualmente
- [ ] Los botones de import (KML, KMZ, DXF) están en la toolbar
- [ ] Los botones de export (KML, DXF) están en el panel lateral

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `package.json` | Agregar `jszip` |
| `src/lib/geo-import.ts` | Agregar `importKmz()` |
| `src/modules/flight-plans/geometry-editor.tsx` | Tile satelital + toolbar + KMZ handler |
