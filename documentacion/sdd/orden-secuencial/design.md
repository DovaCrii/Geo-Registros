# SDD Design: Orden Secuencial del Detalle del Plan

## Arquitectura

La página seguirá siendo un **Server Component** para conservar la carga de datos actual.

## Flujo

1. `searchParams.tab` define el paso activo.
2. La página calcula el bloque visible.
3. La barra superior renderiza links a cada paso.
4. Cada paso muestra un grupo de componentes ya existentes.

## Mapeo de pasos

### Paso 1 — Datos del plan
- Breadcrumbs
- Header
- Entidades relacionadas
- `FlightPlanForm`

### Paso 2 — Geometría
- Resumen de geometría
- Link al editor satelital
- Link al resumen de checklist si ya existe geometría

### Paso 3 — Documentos
- `DocumentUpload`

### Paso 4 — Checklist DGAC
- `FlightPlanChecklist`

### Paso 5 — Permisos
- `PermissionStatusBadge`
- `PermissionActions`
- `PermissionTimeline`

### Paso 6 — Cierre
- `WeatherCard`
- Zona de riesgo / eliminar
- PDF report

## Decisiones

- No usar client state para el tab activo: la URL manda.
- Mantener el render en server para evitar duplicar fetches.
- Reusar los componentes actuales sin reescritura interna.
