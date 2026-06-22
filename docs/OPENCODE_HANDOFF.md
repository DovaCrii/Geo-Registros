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
| **Fase 5 Comercial (actual)** | 🚧 Seed demo, README premium, landing polish |
| **Fase 6 Centro de Conocimiento** | 🔜 Planificado — buscador en vivo + flujo 7 pasos + preview docs |
| **Fase 7 Mapa operacional** | 🔜 Planificado — workspace visual con capas y herramientas |
| **README** | Debe reflejar stack real y posicionamiento comercial |
| **Home page** | Landing premium existente con 7 secciones; sigue en polish |
| **Seed demo** | `SEED_DEMO=true` en seed.cjs — crear demo user y datos vistosos |
| **Workflow Git** | ✅ Operativo — `vibe-check`, `vibe-review` y `git-handoff` disponibles |

## Próxima tarea recomendada

**T-023 — UX/UI refinada y mapa avanzado**
- **Por qué primero:** El panel operativo ya está persistente; ahora toca pulir navegación, coherencia visual y el workspace del mapa.
- **Archivos probables:** `src/app/**`, `src/components/ui/**`, `src/modules/flight-plans/geometry-editor.tsx`
- **Criterio:** Alineación más clara, panel operativo destacado, navegación simple y barra lateral del mapa mejor ordenada.
- **Validación:** `npm run build`, `npm run typecheck`, revisión visual.

## Alcance sugerido
- `src/app/**`, `src/components/ui/**`, `src/modules/flight-plans/geometry-editor.tsx` — polish visual y mapa avanzado.
- `ROADMAP.md`, `TASKS.md`, `PROJECT_STATUS.md`, `docs/OPENCODE_HANDOFF.md` — mantener sincronizados.

## Criterio de aceptación
- Cambio acotado y reversible.
- No modificar lógica de negocio existente ni schema de Prisma.
- Validar con `npm run build` y `npm run typecheck`.

## Prompt corto
Lee `AGENTS.md`, `ROADMAP.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md`. Continuá con la fase comercial: refiná el seed demo, pulí la landing, actualizá el README premium y mantené los docs de seguimiento sincronizados. Validá con `npm run build` antes de commit.
