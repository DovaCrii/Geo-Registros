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
- Fase comercial en curso: landing lista (hero, 7 pasos, 6 módulos, casos de uso), seed demo funcional con SEED_DEMO=true.
- Centro de Conocimiento planificado para reemplazar /ayuda con buscador en vivo + flujo operacional + preview docs.
- Mapa operacional planificado como fase futura (editor geometría con capas y workspace visual).

## Riesgos activos
- `prisma/data/` aparece como dato local no versionado.
- La rama `ux-dgac-login-fix` tiene trabajo local pendiente; evitar mezclar commits ajenos.
- El Centro de Conocimiento requiere diseño de UI no trivial (buscador en vivo, sidebar de flujo operacional, preview de PDF en navegador).
- README premium necesita sincronización con el stack real y posicionamiento comercial.

## Próximos pasos inmediatos
1. **Seed demo refinado** — asegurar que `SEED_DEMO=true` produce datos vistosos
2. **README premium** — posicionamiento comercial con foco en mapa, permisos, trazabilidad
3. **Landing polish** — hero, proof points, CTA más fuertes
4. **Centro de Conocimiento** — buscador en vivo + flujo 7 pasos + vista previa de documentos

## Fuente de verdad para IA
- OpenCode ejecuta implementacion.
- Codex planifica, revisa, documenta y hace QA.
- Engram conserva memoria persistente; no duplicar memoria estable fuera de docs del repo.

## Actualizado
2026-06-18
