# OPENCODE_HANDOFF.md

## Rol de OpenCode
OpenCode ejecuta implementación principal. Codex entrega planes, revisiones, QA y documentación.

## Contexto mínimo a leer
1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `ROADMAP.md`
4. `TASKS.md`
5. `docs/GIT_WORKFLOW_ORCHESTRATOR.md`
6. `docs/OPENCODE_HANDOFF.md`
7. `docs/HANDOFF/GIT_HANDOFF.md` (si existe)
8. `CHANGELOG.md` (últimos cambios)

## Estado actual del proyecto

| Área | Estado |
|---|---|
| **Visual system** (T-011) | ✅ Completo — light-first, tokens `slate-950`, 62 archivos normalizados |
| **Mission flow** (T-010) | ✅ Etapas 1, 3, 4 completas — wizard podado, redirects, progress bar |
| **Fase 4 DGAC** | ✅ Completa — permisos, docs, geometría, checklist, HelpDocs Prisma, 136 tests |
| **Fase 5 Comercial (actual)** | ✅ Completa — seed demo, README premium, landing polish |
| **Fase 6 Centro de Conocimiento** | ✅ Completa — buscador en vivo + flujo 7 pasos + preview docs |
| **Fase 7 Mapa operacional** | ✅ Completa — workspace visual con capas y herramientas |
| **README** | Actualizado con stack real y posicionamiento comercial |
| **Home page** | Landing premium completa con 7 secciones |
| **Seed demo** | `SEED_DEMO=true` en seed.cjs — demo user y datos vistosos |
| **Workflow Git** | ✅ Operativo — `vibe-check`, `vibe-review` y `git-handoff` disponibles |

## Próxima tarea recomendada

**T-022 — RBAC y perfiles de revisión**
- **Por qué primero:** Ya existe el contrato de permisos; ahora toca alinear UI y server actions para que no haya controles visibles sin autorización.
- **Archivos probables:** `src/lib/authorize.ts`, `src/lib/require-page-auth.ts`, `src/app/flight-plans/[id]/page.tsx`, `src/app/api/flight-plans/[id]/dgac-checklist/route.ts`, `src/modules/permissions/**`
- **Criterio:** perfiles de revisión/lectura no pueden editar, borrar ni transicionar permisos; la UI oculta o deshabilita acciones según rol.
- **Validación:** `npm run build`, `npm run typecheck`, revisión de permisos.

## Alcance sugerido
- `src/app/flight-plans/[id]/page.tsx`, `src/modules/permissions/**`, `src/app/api/flight-plans/[id]/dgac-checklist/route.ts` — consistencia RBAC.
- `ROADMAP.md`, `TASKS.md`, `PROJECT_STATUS.md`, `docs/OPENCODE_HANDOFF.md` — mantener sincronizados.

## Criterio de aceptación
- Cambio acotado y reversible.
- No modificar lógica de negocio existente ni schema de Prisma.
- Validar con `npm run build` y `npm run typecheck`.

## Prompt corto
Lee `AGENTS.md`, `ROADMAP.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md`. Continuá con RBAC: alinea UI y server actions del detalle de planes de vuelo, mantiene permisos consistentes y valida con `npm run build` antes de commit.
