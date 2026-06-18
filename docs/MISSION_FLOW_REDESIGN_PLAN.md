# T-010: Rediseño gradual del flujo de misión

## Problema

El flujo actual de planes de vuelo tiene dos experiencias separadas:

1. **Wizard de creación** (6 pasos) — varios pasos son solo informativos sin interacción real
2. **Página de detalle** (6 tabs) — donde realmente se hace el trabajo (geometría, docs, checklist, permisos)

Esto obliga al usuario a: crear → guardar → navegar al detalle → buscar el tab correcto → recién ahí trabajar. Hay fricción innecesaria y pasos del wizard que no agregan valor.

## Principios de diseño

- **Una tarea principal por pantalla** — no abrumar con pasos que no se pueden completar
- **El mapa como herramienta, no decoración** — la geometría debería estar presente desde la creación
- **Estados visibles y accionables** — el usuario siempre sabe qué falta y qué sigue
- **Progresión natural** — crear → definir área → asignar → documentar → revisar → cerrar

## Propuesta de etapas (gradual, por cambios pequeños)

### Etapa 1 — Poda del wizard
- Eliminar pasos 3 y 4 del wizard (solo informativos, sin interacción)
- Mover la nota operativa (step 3) al paso 0 como campo adicional
- El step 5 (revisión) se simplifica
- Resultado: wizard de 3 pasos reales + resumen final

### Etapa 2 — Mapa en creación
- En el paso 2 del wizard, agregar un visor de mapa embebido (no el editor completo, solo un preview)
- El usuario puede ver si ya hay geometría o marcar que la definirá después
- Botón "Definir área después" → redirige al tab de geometría del detalle

### Etapa 3 — Transición natural creación → detalle ✅
- Al crear el plan, redirigir al detalle con el tab activo según el estado:
  - `createFlightPlan` → redirige a `/flight-plans/{id}?tab=2` (geometría) ✅
  - `updateFlightPlan` → se queda en `/flight-plans/{id}` en vez de volver al listado ✅
- El detail page se vuelve el centro operativo real

### Etapa 4 — Barra de progreso en detalle
- Agregar indicador visual en el detail: "Pasos completados: X/6"
- El tab activo se resalta en la navegación
- Tooltip o mini-alerta en cada tab si falta algo

## Archivos a modificar (por etapa)

| Etapa | Archivos | Cambio |
|---|---|---|
| 1 | `src/modules/flight-plans/flight-plan-wizard-form.tsx` | Sacar pasos 3-4, simplificar steps |
| 1 | `src/app/flight-plans/new/page.tsx` | Si cambia el form, ajustar import |
| 2 | `src/modules/flight-plans/flight-plan-wizard-form.tsx` | Agregar mapa preview embebido |
| 3 | `src/app/flight-plans/new/page.tsx` | Redirect post-creación con tab |
| 3 | `src/app/flight-plans/[id]/page.tsx` | Aceptar query param `?tab=N` en creación |
| 4 | `src/app/flight-plans/[id]/page.tsx` | Barra de progreso + tooltips |

## Criterios de aceptación

- [ ] Wizard tiene solo pasos accionables (sin páginas solo informativas)
- [ ] Al crear un plan, el usuario llega al detalle en el paso correcto
- [ ] La barra de navegación del detalle muestra progreso real
- [ ] Build y typecheck pasan en cada etapa

## Próximo paso concreto

**Empezar por Etapa 1** — podar los pasos informativos del wizard. Es el cambio más chico, más seguro y más visible para el usuario.
