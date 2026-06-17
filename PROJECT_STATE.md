# PROJECT_STATE.md

## Resumen actual
AeroFlow es una plataforma Next.js 15 para operaciones de drones y RPA con enfoque en misiones, permisos, geometría, documentos, notificaciones y trazabilidad.

## Estructura relevante
- `src/app/`: páginas y rutas App Router
- `src/modules/`: módulos de UI y flujos funcionales
- `src/server/`: lógica de servidor, queries, actions y servicios
- `src/components/ui/`: componentes reutilizables
- `prisma/`: esquema, migraciones, seed y base local de desarrollo
- `docs/`: documentación funcional y técnica
- `.atl/`: registro local relacionado con Engram

## Estado actual
- La base funcional está avanzada y documentada en `README.md` y `docs/`.
- El proyecto usa TypeScript, Next.js, Prisma y Vitest.
- El esquema Prisma detectado apunta a SQLite en desarrollo con `prisma/data/aeroflow.db`.
- Existe documentación local de referencia en `.atl/skill-registry.md` que ya cumple el rol de memoria persistente para Engram.
- Esta capa de Codex se agrega solo como apoyo secundario de revisión, planeación breve y QA.

## Próximos pasos
- Mantener `AGENTS.md` como contrato operativo entre OpenCode y Codex.
- Usar Codex para revisar tareas pequeñas antes de ejecución.
- Usar OpenCode para implementar cambios amplios o sensibles.
- Registrar decisiones técnicas nuevas en `DECISIONS.md`.
- Registrar bugs y riesgos reales en `KNOWN_BUGS.md`.

## Riesgos
- Hay una diferencia entre la documentación general del repo y el datasource real de Prisma: `README.md` describe PostgreSQL/PostGIS como objetivo, pero el esquema detectado usa SQLite.
- El repositorio contiene trabajo local sin seguimiento en `prisma/data/`; debe tratarse con cuidado para no mezclarlo con esta configuración.
- Si Codex y OpenCode guardan memoria duplicada, se puede perder consistencia entre fuentes de verdad.
- Las skills de Codex deben permanecer acotadas para no convertirlo en orquestador principal.

## Fecha de actualización
- 2026-06-17
