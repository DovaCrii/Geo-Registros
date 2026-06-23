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
- Workflow de Git operativo: scripts `vibe-check`, `vibe-review` y `git-handoff` disponibles en el repo.
- Nuevo foco: RBAC/reviewer roles, trazabilidad documental y UX/UI refinada.

## Riesgos activos
- `prisma/data/` aparece como dato local no versionado.
- La rama `ux-dgac-login-fix` tiene trabajo local pendiente; evitar mezclar commits ajenos.
- El RBAC debe aplicarse en UI y server actions sin dejar acciones huérfanas visibles.
- La UX/UI refinada requiere coherencia visual: alineación, jerarquía, colores semánticos y navegación clara.
- El mapa avanzado necesita diseñar bien capas extra (ciudades/referencias) sin saturar al operador.

## Próximos pasos inmediatos
1. **RBAC y perfiles de revisión** — cerrar consistencia de permisos en UI y server actions
2. **Trazabilidad documental** — preview de paquete, vista revisor y microinteracciones
3. **UX/UI refinada** — centrar información, mejorar navegación, empty states y calendario

## Fuente de verdad para IA
- OpenCode ejecuta implementacion.
- Codex planifica, revisa, documenta y hace QA.
- Engram conserva memoria persistente; no duplicar memoria estable fuera de docs del repo.
- Los handoffs locales se regeneran con `node scripts/vibe-check.js`, `node scripts/vibe-review.js` y `node scripts/git-handoff.js`.

## Actualizado
2026-06-22
