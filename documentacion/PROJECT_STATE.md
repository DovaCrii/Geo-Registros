# PROJECT_STATE.md

## Resumen actual
AeroFlow es una plataforma Next.js 15 para operaciones de drones y RPA con enfoque en misiones, permisos, geometría, documentos, notificaciones y trazabilidad.

## Estructura relevante
- `apps/web/src/app/`: páginas y rutas App Router
- `apps/web/src/modules/`: módulos de UI y flujos funcionales
- `apps/web/src/server/`: lógica de servidor, queries, actions y servicios
- `apps/web/src/components/ui/`: componentes reutilizables
- `backend/prisma/`: esquema, migraciones, seed y base local de desarrollo
- `backend/storage/`: archivos de almacenamiento local del entorno
- `documentacion/`: documentación funcional, técnica y de seguimiento
- `tooling/`: registro local relacionado con Engram y skills de IA

## Estado actual
- La base funcional está avanzada y documentada en `README.md` y `documentacion/`.
- El proyecto usa TypeScript, Next.js, Prisma y Vitest.
- El esquema Prisma detectado apunta a SQLite en desarrollo con `backend/prisma/data/aeroflow.db`.
- Existe documentación local de referencia en `tooling/skill-registry.md` que ya cumple el rol de memoria persistente para Engram.
- Esta capa de Codex se agrega solo como apoyo secundario de revisión, planeación breve y QA.

## Próximos pasos
- Mantener `AGENTS.md` como contrato operativo entre OpenCode y Codex.
- Usar Codex para revisar tareas pequeñas antes de ejecución.
- Usar OpenCode para implementar cambios amplios o sensibles.
- Registrar decisiones técnicas nuevas en `documentacion/DECISIONS.md`.
- Registrar bugs y riesgos reales en `documentacion/KNOWN_BUGS.md`.

## Riesgos
- Hay una diferencia entre la documentación general del repo y el datasource real de Prisma: `README.md` describe PostgreSQL/PostGIS como objetivo, pero el esquema detectado usa SQLite.
- El repositorio contiene trabajo local sin seguimiento en `backend/prisma/data/`; debe tratarse con cuidado para no mezclarlo con esta configuración.
- Si Codex y OpenCode guardan memoria duplicada, se puede perder consistencia entre fuentes de verdad.
- Las skills de Codex deben permanecer acotadas para no convertirlo en orquestador principal.

## Fecha de actualización
- 2026-06-18
