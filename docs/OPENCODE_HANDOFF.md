# OPENCODE_HANDOFF.md

## Rol de OpenCode
OpenCode ejecuta implementacion principal. Codex entrega planes, revisiones, QA y documentacion.

## Contexto minimo a leer
1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `ROADMAP.md`
4. `TASKS.md`
5. `docs/OPENCODE_HANDOFF.md`

## Proxima tarea recomendada
Tomar `T-011` y definir el sistema visual base antes de seguir redisenando pantallas.

## Alcance sugerido
- Revisar `docs/DESIGN_SYSTEM_PLAN.md`.
- Identificar tokens actuales en `src/app/globals.css`.
- Proponer una tarea pequena para mejorar un componente compartido sin refactor global.

## Criterio de aceptacion
- Cambio acotado y reversible.
- Sin modificar logica de negocio.
- Sin tocar Prisma ni base de datos.
- Validar con `npm run typecheck`.

## Prompt corto
Lee `AGENTS.md`, `PROJECT_STATUS.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md`. Ejecuta la proxima tarea pequena sin tocar logica de negocio y actualiza `docs/AI_PROGRESS_LOG.md`.
