# SDD Proposal: Orden Secuencial del Detalle del Plan

## Situación actual

`/flight-plans/[id]/page.tsx` renderiza TODO en una sola página scroll:
- Formulario, permisos, documentos, checklist, clima, timeline, eliminar
- No hay separación visual ni orden lógico
- El usuario no sabe qué falta ni en qué paso está

## Propuesta

Dividir en **6 tabs secuenciales** con barra de progreso:

| # | Tab | Contenido |
|---|---|---|
| 1 | 📋 Datos del plan | FlightPlanForm + entidades relacionadas |
| 2 | 🗺️ Geometría | Estado actual + link al editor satelital |
| 3 | 📄 Documentos | DocumentUpload existente |
| 4 | ✅ Checklist DGAC | FlightPlanChecklist + checklistReview status |
| 5 | 🔄 Permisos | PermissionActions + PermissionTimeline |
| 6 | 🌤️ Cierre | WeatherCard + Zona de riesgo + Reporte PDF |

## Comportamiento

- **Navegación libre**: el usuario puede saltar entre tabs cuando quiera
- **Barra de progreso**: cada tab muestra ✓ si la sección está completa, ○ si no
- **Scroll por tab**: cada tab es una viewport independiente (no scroll infinito)
- **Estado persistente**: el tab activo se mantiene en URL searchParams (`?tab=2`)

## Scope (IN)

- PageShell contenedor con tabs + barra de progreso
- Mover secciones existentes a tabs (sin modificar lógica interna)
- `searchParams.tab` para persistir tab activo

## Scope (OUT)

- No cambiar FlightPlanForm, DocumentUpload, PermissionActions, etc. (solo moverlos)
- No agregar lógica nueva de negocio
- No cambiar el editor de geometría

## Archivos a tocar

| Archivo | Cambio |
|---|---|
| `src/app/flight-plans/[id]/page.tsx` | Reemplazar layout plano por tabs + secciones |

## Esfuerzo estimado

- Crear estructura de tabs: ~1h
- Mover secciones a cada tab: ~1h
- Barra de progreso: ~30min
- Total: ~2.5-3h
