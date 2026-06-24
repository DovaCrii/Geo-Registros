# OPENCODE_HANDOFF.md

## Rol de OpenCode
OpenCode ejecuta implementación principal. Codex entrega planes, revisiones, QA y documentación.

## Contexto mínimo a leer (siempre en este orden)
1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `ROADMAP.md`
4. `TASKS.md`
5. `docs/GIT_WORKFLOW_ORCHESTRATOR.md` — **nuevo: protocolo de orquestación por Git**
6. `docs/OPENCODE_HANDOFF.md` (este archivo)
7. `docs/HANDOFF/GIT_HANDOFF.md` — **si existe, es el estado más reciente post-push**
8. `CHANGELOG.md` (últimos cambios)

## Estado actual del proyecto (post-commit `e04f181`)

| Área | Estado |
|---|---|
| **Visual system** (T-011) | ✅ Completo — light-first, tokens `slate-950`, 62 archivos normalizados |
| **Mission flow** (T-010) | ✅ Wizard podado a pasos accionables, redirects a detalle, progress bar en tabs |
| **Fase 4 DGAC** | ✅ Completa — permisos, docs, geometría, checklist, HelpDocs Prisma, 136 tests |
| **Fase 5 Comercial** | ✅ Completa — landing premium, seed demo, README premium |
| **Fase 6 Centro de Conocimiento** | ✅ Completa — buscador en vivo, flujo 7 pasos, preview docs |
| **Fase 7 Mapa operacional** | ✅ Completa — workspace visual, mediciones en vivo, import/export KML/KMZ/DXF |
| **Fase 8 RBAC base** | ✅ Completa — `isReviewer`, `canEditEntity`, `requireFlightPlanEditor` en `authorize.ts` |
| **T-024 StatusBadge** | ✅ Completo — 5 variantes semánticas aplicadas en lista, detalle y dashboard |
| **T-025 Validación inline** | ✅ Completo — controlled inputs, errores visuales, draft en localStorage |
| **T-026 Panel operativo** | 🔜 Pendiente — sticky bar con misión activa + clima + alertas |
| **T-023 UX/UI refinada** | 🔜 Pendiente — alineación, navegación, coherencia visual transversal |
| **T-035 Dashboard semáforo** | 🔜 Pendiente — próxima misión autorizada, widget de vigencias |

## Próxima tarea recomendada

**T-026 — Panel operativo persistente (sticky bar)**
- **Por qué primero:** Es el siguiente paso lógico después de T-025. El usuario ahora valida campos en el wizard; necesita ver el estado operativo persistente al navegar la app.
- **Archivos probables:** `src/components/operational-panel.tsx`, `src/app/layout.tsx`, `src/app/dashboard/page.tsx`
- **Criterio:** Barra visible con misión activa, clima simulado y alertas de vigencia. Colapsa a "pill" si no hay misión activa.
- **Validación:** `npm run build`, `npm run typecheck`, smoke visual en navegación entre páginas.

**Alternativa (si usuario prioriza):** T-035 — Dashboard semáforo operativo, porque impacta directamente en la pregunta "¿Puedo volar hoy?".

## Flujo de trabajo obligatorio

OpenCode DEBE seguir el **Git Context Protocol (GCP)** definido en `docs/GIT_WORKFLOW_ORCHESTRATOR.md`:

1. **Vibe Check** al inicio: `node scripts/vibe-check.js` (genera `docs/HANDOFF/VIBE_CHECK.md`)
2. **Vibe Plan** con 1 tarea de TASKS.md (crear `docs/HANDOFF/feat-T-XXX.md` si es necesario)
3. **Vibe Code** en branch `feat/T-XXX` con commits atómicos siguiendo GCP
4. **Vibe Review** antes de push: `node scripts/vibe-review.js` (genera `docs/HANDOFF/VIBE_REVIEW.md`)
5. **Vibe Handoff** después de push: `node scripts/git-handoff.js` (genera `docs/HANDOFF/GIT_HANDOFF.md`)

### Commit template (copiar y pegar en el editor de commit)
```
type(scope): T-XXX — descripción

[What] 
[Why] 
[How] 
[Next] 
[Validate] 
[Files] 
[Agent] OpenCode
```

## Alcance sugerido (para T-026)
- `src/components/operational-panel.tsx` — componente nuevo, sticky o fixed.
- `src/app/layout.tsx` — integrar el panel en el layout raíz.
- `src/app/dashboard/page.tsx` — opcional: sincronizar datos del panel con dashboard.
- No modificar schema de Prisma ni lógica de negocio existente.
- Usar datos del demo seed si `SEED_DEMO=true` está activo.

## Criterio de aceptación
- Cambio acotado y reversible.
- No modificar lógica de negocio existente ni schema de Prisma.
- Validar con `npm run build && npm run typecheck` antes de commit.
- Commit con GCP completo (What/Why/How/Next/Validate/Files/Agent).
- TASKS.md actualizado si se completa una tarea o se descubre una nueva.

## Prompt corto para OpenCode
```
Lee AGENTS.md, PROJECT_STATUS.md, ROADMAP.md, TASKS.md,
docs/GIT_WORKFLOW_ORCHESTRATOR.md y docs/HANDOFF/GIT_HANDOFF.md (si existe).
Ejecutá node scripts/vibe-check.js para contexto vivo.
Continuá con la tarea indicada como "Próxima tarea recomendada".
Validá con npm run build && npm run typecheck antes de commit.
Usá Git Context Protocol en el mensaje de commit.
```

## Prompt de salida para OpenCode
```
Generá el commit con GCP incluyendo [What], [Why], [How], [Next], [Validate],
[Files], [Agent]. Ejecutá node scripts/vibe-review.js para auto-QA.
Actualizá TASKS.md si completaste una tarea. Hacé push y ejecutá
node scripts/git-handoff.js para generar el handoff de la sesión.
No hagas merge a main sin aprobación.
```

---

**Actualizado:** 2026-06-22
**Commit de referencia:** `e04f181` — feat: polish flight-plan workflow and docs
