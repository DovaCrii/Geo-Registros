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

## Próxima tarea recomendada

**Fase comercial — polish y demo:**
1. Refinar seed demo: crear demo user automático para login sin configuración.
2. Landing: fortalecer hero, proof points numéricos y CTA.
3. README premium: posicionamiento con foco en mapa, permisos, trazabilidad.
4. Preparar commits separados y push.

## Alcance sugerido
- `prisma/seed.cjs` — demo user, demo data refinada.
- `src/app/page.tsx` — polish de hero, proof points, CTA.
- `README.md` — actualizar con stack real y valor comercial.
- `ROADMAP.md`, `TASKS.md`, `PROJECT_STATUS.md` — mantener sincronizados.

## Criterio de aceptación
- Cambio acotado y reversible.
- No modificar lógica de negocio existente ni schema de Prisma.
- Seed debe ejecutarse sin errores con `SEED_DEMO=true`.
- Validar con `npm run build`.

## Prompt corto
Lee `AGENTS.md`, `ROADMAP.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md`. Continuá con la fase comercial: refiná el seed demo, pulí la landing, actualizá el README premium y mantené los docs de seguimiento sincronizados. Validá con `npm run build` antes de commit.
