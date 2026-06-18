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
- UX del dashboard en mejora hacia centro operativo mas claro.
- Documentacion historica existe en `docs/`; esta capa nueva resume la direccion futura.
- Sistema visual base completamente aplicado y commiteado (T-011 ✅, 55 archivos, commit `136c0b6`).

## Riesgos activos
- `prisma/data/` aparece como dato local no versionado.
- Quedan pantallas heredadas puntuales por refinar, pero la direccion visual base ya esta consolidada.

## Fuente de verdad para IA
- OpenCode ejecuta implementacion.
- Codex planifica, revisa, documenta y hace QA.
- Engram conserva memoria persistente; no duplicar memoria estable fuera de docs del repo.

## Actualizado
2026-06-18
