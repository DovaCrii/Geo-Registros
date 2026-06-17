# SDD Spec: Orden Secuencial del Detalle del Plan

## Objetivo
Convertir `/flight-plans/[id]` en un flujo guiado por pasos para reducir carga cognitiva y ordenar el trabajo operativo.

## Requisitos

### R1 — Navegación por pasos
- La página debe exponer 6 pasos visibles.
- El paso activo se controla por `searchParams.tab`.
- Si no hay `tab`, se usa el paso 1.

### R2 — Secuencia funcional
- Paso 1: Datos del plan
- Paso 2: Geometría
- Paso 3: Documentos
- Paso 4: Checklist DGAC
- Paso 5: Permisos
- Paso 6: Cierre

### R3 — Persistencia de estado
- Cambiar de paso usa enlaces con query string (`?tab=2`, etc.).
- El estado activo debe sobrevivir al refresh.

### R4 — Mismos datos, mejor orden
- No se cambia la lógica de negocio existente.
- Solo se reorganizan los bloques ya renderizados.

## Criterios de aceptación
- [ ] La página muestra una barra de pasos con 6 items
- [ ] Cada paso abre su bloque correspondiente
- [ ] El tab activo se conserva en URL
- [ ] No se rompe el formulario, checklist, permisos, documentos ni clima

## Alcance fuera de scope
- No refactorizar `FlightPlanForm` internamente
- No cambiar reglas de negocio del permiso/checklist
- No agregar nuevas APIs
