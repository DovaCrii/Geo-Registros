# OPENCODE_HANDOFF.md

## Rol de OpenCode
OpenCode ejecuta implementación principal. Codex entrega planes, revisiones, QA y documentación.

## Contexto mínimo a leer
1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `ROADMAP.md`
4. `TASKS.md`
5. `docs/OPENCODE_HANDOFF.md`
6. `CHANGELOG.md` (últimos cambios)

## Estado actual del proyecto

| Área | Estado |
|---|---|
| **Visual system** (T-011) | ✅ Completo — light-first, tokens `slate-950`, 62 archivos normalizados |
| **Mission flow** (T-010) | ✅ Etapas 1, 3, 4 completas — wizard podado, redirects, progress bar |
| **Fase 4 DGAC** | ✅ Completa — permisos, docs, geometría, checklist alineados; FlowGuide 16 rutas |
| **Fase 5 (actual)** | 🚧 Polish comercial + mapa operacional antes de demo data |
| **README** | Sincronizado con stack real; debe reflejar la fase mapa-first |
| **Home page** | Landing comercial existente, ahora en polish para mayor impacto |
| **Geometry workspace** | En mejora hacia mapa-first con capas y GeoJSON avanzado |

## Próxima tarea recomendada

**Fase mapa-first — QA y cierre visual:**
1. Validar landing, navegación, wizard y editor de geometría en navegador.
2. Confirmar que el dibujo de punto/línea/polígono sincroniza y guarda correctamente.
3. Preparar commits separados y push de la rama antes de merge a `main`.

## Alcance sugerido
- `src/app/page.tsx` — revisar impacto visual de la landing.
- `src/components/ui/page-shell.tsx` — confirmar que Inicio redundante desaparece.
- `src/modules/flight-plans/flight-plan-wizard-form.tsx` — validar alta sin GeoJSON visible.
- `src/modules/flight-plans/geometry-editor.tsx` — validar toolbar, capas, import/export y guardado.
- Mantener docs sincronizadas si QA encuentra ajustes.

## Criterio de aceptación
- Cambio acotado y reversible.
- No modificar lógica de negocio existente ni schema de Prisma.
- GeoJSON se mantiene como formato interno/avanzado, no como paso principal.
- Validar con `npm run typecheck`, `npm run test` y `npm run build`.

## Prompt corto
Lee `AGENTS.md`, `ROADMAP.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md`. Revisá la fase mapa-first: valida landing, navegación, wizard y editor de geometría; corrige solo bugs visuales o de sincronización; no cambies Prisma ni lógica de negocio.
