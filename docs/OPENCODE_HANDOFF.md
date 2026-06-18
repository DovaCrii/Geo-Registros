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
Tomar el cierre de T-011: peinar los restos heredados, mantener la documentacion sincronizada y preparar un corte limpio para GitHub.

## Alcance sugerido
- Revisar `docs/DESIGN_SYSTEM_PLAN.md`.
- Identificar las pantallas heredadas que todavia requieran ajuste visual puntual.
- Mantener `PROJECT_STATUS.md`, `ROADMAP.md`, `TASKS.md` y `docs/AI_PROGRESS_LOG.md` sincronizados con el avance real.

## Criterio de aceptacion
- Cambio acotado y reversible.
- Sin modificar logica de negocio.
- Sin tocar Prisma ni base de datos.
- Validar con `npm run typecheck`.
- Mantener el working tree limpio de artefactos de build.

## Prompt corto
Lee `AGENTS.md`, `PROJECT_STATUS.md`, `ROADMAP.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md`. Cierra el frente visual pendiente sin tocar logica de negocio y actualiza `docs/AI_PROGRESS_LOG.md`.
