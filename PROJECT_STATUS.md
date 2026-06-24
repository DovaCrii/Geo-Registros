# PROJECT_STATUS.md

## Estado maestro
AeroFlow / Geo-Registros es una plataforma Next.js para operaciones RPA/drones: misiones, permisos DGAC/SIGO, documentos, mapa, geometria, trazabilidad, reportes y workflow operacional.

## Stack actual
- Next.js 15, React 19, TypeScript, Tailwind CSS 3.
- Prisma 6 con datasource local SQLite detectado en `prisma/schema.prisma`.
- NextAuth, MapLibre, TerraDraw, Vitest, PDF/Excel export.

## Modulos principales
- Dashboard operativo y KPIs.
- Datos maestros: centros de costo, clientes, drones, operadores.
- Planes de vuelo con geometria, documentos, permisos y checklist DGAC.
- Ayuda contextual, notificaciones, reportes y auditoria de eventos.

## Estado de producto
- Base funcional avanzada y documentada.
- Fase DGAC completa: checklist, permisos, HelpDocs en Prisma, tests de componente (136 tests pasando).
- Fase comercial completa: landing premium, seed demo funcional con SEED_DEMO=true y README premium actualizado.
- Centro de Conocimiento completo: buscador en vivo, flujo operacional, preview docs.
- Mapa operacional completo: workspace visual, mediciones en vivo, import/export y GeoJSON avanzado oculto.
- RBAC base completo: helpers isReviewer, canEditEntity, requireFlightPlanEditor en authorize.ts.
- Validación inline en wizard: controlled inputs, errores visuales, draft en localStorage.
- Sistema de colores semánticos: StatusBadge con 5 variantes aplicado en lista, detalle y dashboard.
- Panel operativo persistente: sticky cues y panel lateral más claro en el shell y dashboard.
- Empty states con acción contextual: CTA primaria y secundaria en listas.
- Vista calendario de operaciones: toggle por fecha en planes de vuelo.
- Modo campo: toggle persistente para tablets / terreno.
- Alertas geográficas: detección de zonas restringidas en geometría.
- Vista revisor: modo comparación + notas locales en el detalle del plan.
- Paquete documental: preflight visual con acceso al PDF de revisión.
- Dashboard semáforo: readiness verde/amarillo/rojo con contadores existentes.
- Microinteracciones de estado: transiciones de permiso con feedback visible y helpers puros para test.
- Nuevo foco: UX/UI refinada (panel operativo, empty states, calendario) + mapa avanzado + trazabilidad documental.
- Nuevo foco: pulido visual final y handoff Figma-ready.

## Riesgos activos
- `prisma/data/` aparece como dato local no versionado.
- La rama `ux-dgac-login-fix` tiene trabajo local pendiente; evitar mezclar commits ajenos.
- El RBAC debe aplicarse en UI y server actions sin dejar acciones huérfanas visibles.
- La UX/UI refinada requiere coherencia visual: alineación, jerarquía, colores semánticos y navegación clara.
- El mapa avanzado necesita diseñar bien capas extra (ciudades/referencias) sin saturar al operador.

## Próximos pasos inmediatos
1. **UX/UI refinada transversal (T-023)** — polish restante y mapa avanzado
2. **Consolidar documentación y handoffs** — README y bitácoras alineadas con el estado actual
3. **Revisión final de consistencia** — pequeños ajustes visuales/responsivos si aparecen
4. **Figma handoff** — frames, tokens y componentes clave para continuar diseño sin arrancar de cero.

## Fuente de verdad para IA
- OpenCode ejecuta implementacion.
- Codex planifica, revisa, documenta y hace QA.
- Engram conserva memoria persistente; no duplicar memoria estable fuera de docs del repo.
- Git Workflow Orchestrator en `docs/GIT_WORKFLOW_ORCHESTRATOR.md` define el flujo de orquestación por commits.
- Handoffs generados automáticamente en `docs/HANDOFF/` después de cada push.

## Actualizado
2026-06-24
