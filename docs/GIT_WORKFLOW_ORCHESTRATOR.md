# Git Workflow Orchestrator — AeroFlow

> Protocolo de orquestación mediante Git para que OpenCode (y cualquier agente) pueda continuar el trabajo sin pérdida de contexto entre sesiones.

---

## Filosofía: Git como Memoria Operativa

En lugar de depender únicamente de la memoria de conversación o documentos estáticos, **usamos Git como el estado vivo del proyecto**. Cada commit cuenta una historia completa: qué se hizo, por qué, cómo, qué se validó y qué sigue.

Los documentos de handoff (`OPENCODE_HANDOFF.md`, `GIT_HANDOFF.md`) son **vistas generadas** del estado Git + TASKS.md, no fuentes de verdad independientes.

---

## 1. Estrategia de Branches (Git Flow Semántico)

| Prefijo | Propósito | Quién | Ejemplo |
|---|---|---|---|
| `main` | Demo/estable. Solo merge vía PR. | Human + Codex | `main` |
| `feat/T-XXX` | Feature específica de TASKS.md. | OpenCode | `feat/T-026-panel-operativo` |
| `ux/` | Mejoras UX/UI transversales. | OpenCode | `ux/dgac-login-fix` |
| `codex/` | Documentación, QA, revisión, planes. | Codex | `codex/docs-dashboard-clean` |
| `hotfix/` | Corrección urgente sin planificación. | OpenCode | `hotfix/build-fail-typecheck` |
| `release/` | Preparación de demo/entrega. | Codex + human | `release/v1.0-demo` |

### Reglas de branch
1. **Una tarea = una branch**. No mezclar T-026 con T-027 en la misma branch.
2. **Branch desde `main` actualizado** (`git checkout main && git pull && git checkout -b feat/T-XXX`).
3. **Commits atómicos** por sub-tarea dentro de la branch.
4. **Merge solo con handoff validado** y checklist de QA.

---

## 2. Convención de Commits (Git Context Protocol)

Cada commit DEBE seguir este formato estructurado para que sea parseable por agentes:

```
type(scope): T-XXX — descripción corta (máx 72 chars)

[What] Qué cambió exactamente
[Why] Por qué se hizo (qué problema resuelve)
[How] Cómo se implementó (approche técnico)
[Next] Qué sigue inmediatamente después de este commit
[Validate] Cómo se validó (build, typecheck, tests, smoke)
[Files] Archivos clave que tocaron (máx 5)
[Agent] Quién ejecutó: OpenCode / Codex / human
```

### Tipos permitidos
| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `perf` | Mejora de rendimiento |
| `refactor` | Reestructuración sin cambio de comportamiento |
| `docs` | Documentación |
| `test` | Tests nuevos o corregidos |
| `ux` | Cambio visual/UX puro |
| `chore` | Tareas de mantenimiento |

### Ejemplo real
```
feat(rbac,wizard): T-022/T-025 — Validación inline + helpers de rol

[What] Agrega canEditEntity, isReviewer, requireFlightPlanEditor en
authorize.ts. Wizard ahora usa controlled inputs con errores visuales,
borders semánticos y draftKey en localStorage.

[Why] Los usuarios operativos necesitan saber qué campos faltan antes de
avanzar en el wizard. El RBAC requiere diferenciar editores de revisores
sin cambiar el enum de Prisma.

[How] Funciones string-based en authorize.ts para compatibilidad con UI.
fieldClass() con border-rose para errores. useEffect carga/salva draft en
localStorage por código de plan.

[Next] T-026 — Panel operativo persistente (sticky bar). O T-023 — UX/UI
refinada general si el usuario prioriza coherencia visual.

[Validate] npm run build ✅, npm run typecheck ✅, smoke manual de wizard
con errores forzados.

[Files] src/lib/authorize.ts, src/modules/flight-plans/flight-plan-wizard-form.tsx

[Agent] OpenCode
```

---

## 3. Flujo de Trabajo Vibecoding (5 Pasos)

### Paso 1: Vibe Check (Entrada)
**Antes de escribir código**, OpenCode ejecuta:
```bash
# Script automatizado
node scripts/vibe-check.js
```
Este script genera `docs/HANDOFF/VIBE_CHECK.md` con:
- Estado actual de branches (`git branch -a`)
- Últimos 5 commits con su contexto
- Archivos más calientes (más modificados en últimos 7 días)
- Tareas pendientes de TASKS.md con prioridad Alta
- Riesgos activos de PROJECT_STATUS.md

### Paso 2: Vibe Plan (Planificación)
Codex (o el usuario) selecciona **una sola tarea** de TASKS.md.
Se crea un handoff escrito en `docs/HANDOFF/feat-T-XXX.md`:
- Objetivo de 1-2 líneas
- Archivos probables (máx 5)
- Criterio de aceptación
- Validación esperada

### Paso 3: Vibe Code (Implementación)
OpenCode trabaja en la branch `feat/T-XXX`:
1. Lee el handoff
2. Implementa cambios atómicos
3. Commits con GCP (Git Context Protocol)
4. Valida con `npm run build && npm run typecheck` (y tests si aplica)
5. NO hace merge a main

### Paso 4: Vibe Review (Auto-revisión)
Antes de push, OpenCode ejecuta:
```bash
node scripts/vibe-review.js
```
Genera `docs/HANDOFF/VIBE_REVIEW.md` con:
- Diff resumido del último commit
- Checklist de calidad (accesibilidad, consistencia visual, tipado)
- Preguntas abiertas para el usuario o Codex

### Paso 5: Vibe Handoff (Salida)
Después de push, se genera automáticamente `docs/HANDOFF/GIT_HANDOFF.md`:
- Resumen del trabajo de la sesión
- Estado de validación (✅/❌)
- Próxima tarea sugerida
- Archivos que necesitan atención

---

## 4. Post-Push: Generación Automática de Contexto

### Script `scripts/git-handoff.js`
Ejecutado después de `git push` (vía post-push hook o manualmente):

```bash
node scripts/git-handoff.js
```

**Qué hace:**
1. Lee el último commit y extrae `[What]`, `[Why]`, `[Next]`, `[Validate]`
2. Actualiza `CHANGELOG.md` con una línea si `[Agent]` es OpenCode
3. Actualiza `PROJECT_STATUS.md` con estado actualizado si el commit es tipo `feat` o `fix`
4. Genera `docs/HANDOFF/GIT_HANDOFF.md` con:
   - Diff summary (stats only, no contenido completo)
   - Tareas completadas detectadas desde TASKS.md
   - Próxima tarea sugerida (la primera pendiente de prioridad Alta)
   - Archivos calientes del último commit
5. Si `[Validate]` incluye `npm run build ✅`, marca la tarea como verificada

### Estructura de `docs/HANDOFF/GIT_HANDOFF.md`

```markdown
# Git Handoff — [fecha]

## Último commit
[hash] [type](scope): descripción

## Resumen del cambio
[What extraído del commit]

## Validación
[Validate extraído del commit]

## Tareas actualizadas
- ✅ T-025 — Validación inline en wizard
- 🔜 T-026 — Panel operativo persistente

## Archivos calientes
- src/lib/authorize.ts (+36 líneas)
- src/modules/flight-plans/flight-plan-wizard-form.tsx (+133 líneas)

## Próxima acción prioritaria
Implementar T-026: Panel operativo persistente (sticky bar).
Handoff: docs/HANDOFF/feat-T-026.md

## Riesgos vigentes
[Copiado de PROJECT_STATUS.md]
```

---

## 5. Sincronización Documental Obligatoria

Después de cada commit `feat`, `fix`, `ux` o `perf`:

| Documento | Quién actualiza | Trigger | Regla |
|---|---|---|---|
| `CHANGELOG.md` | Script auto | Post-push | Añadir línea con hash y descripción |
| `TASKS.md` | OpenCode manual | Post-commit | Marcar ✅ tarea completada, agregar nueva si se descubrió |
| `ROADMAP.md` | Codex | Post-merge a main | Marcar fases completadas |
| `PROJECT_STATUS.md` | Codex | Post-merge o riesgo nuevo | Actualizar estado, riesgos, próximos pasos |
| `DECISIONS.md` | Codex | Decisión técnica nueva | Fecha, decisión, motivo, impacto |
| `OPENCODE_HANDOFF.md` | Codex | Pre-sesión OpenCode | Contexto mínimo y próxima tarea concreta |

**Regla de oro:** Si un commit tocó una tarea documentada en TASKS.md, esa tarea debe reflejar el estado actual antes del push.

---

## 6. Checklist de Calidad Pre-Push

Antes de cualquier push, debe cumplirse:

- [ ] Commit sigue GCP (tiene `[What]`, `[Why]`, `[Next]`, `[Validate]`)
- [ ] `npm run build` pasa ✅
- [ ] `npm run typecheck` pasa ✅
- [ ] Si hay tests, `npm run test` pasa ✅ (o se documenta qué falla y por qué)
- [ ] TASKS.md está sincronizado (tarea completada marcada, nueva tarea agregada si se descubrió)
- [ ] No hay archivos sin registrar en el commit (nada en `git status` sin explicación)
- [ ] La branch tiene nombre semántico (`feat/T-XXX`, `ux/`, etc.)
- [ ] No se modificó `prisma/data/aeroflow.db` (salvo que sea intencional y documentado)
- [ ] No se duplicó memoria de Engram en docs

---

## 7. Flujo Visual de Trabajo

```
┌─────────────────┐
│   Vibe Check    │  ← scripts/vibe-check.js
│ (leer estado)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vibe Plan     │  ← Codex / usuario elige T-XXX
│ (1 tarea, handoff)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│   Vibe Code     │────→│  Git Commit  │← GCP obligatorio
│ (implementar)   │     │  (atómico)   │
└────────┬────────┘     └──────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Vibe Review    │────→│  Validación  │← build + typecheck + tests
│ (auto-QA)       │     │  (obligatoria)│
└────────┬────────┘     └──────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Vibe Handoff   │────→│  Git Push +      │
│ (documentar)    │     │  scripts/git-handoff.js
└─────────────────┘     └──────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  GIT_HANDOFF.md generado │
                    │  OpenCode lee y continúa │
                    └────────────────────────┘
```

---

## 8. Configuración Inicial (Setup)

Para activar este workflow en el repo:

```bash
# 1. Instalar hooks opcionales (post-commit y post-push)
mkdir -p .githooks
cp scripts/githooks/post-commit .githooks/
cp scripts/githooks/post-push .githooks/
git config core.hooksPath .githooks

# 2. Crear directorio de handoffs
mkdir -p docs/HANDOFF

# 3. Verificar que los scripts existen
ls scripts/vibe-check.js scripts/vibe-review.js scripts/git-handoff.js
```

> **Nota:** Los hooks son opcionales. Si prefieres control manual, ejecuta `node scripts/git-handoff.js` después de cada push.

---

## 9. Integración con OpenCode

### Prompt de entrada para OpenCode (usar siempre)

```
Lee AGENTS.md, PROJECT_STATUS.md, ROADMAP.md, TASKS.md, docs/OPENCODE_HANDOFF.md
y docs/HANDOFF/GIT_HANDOFF.md (si existe). Continuá con la tarea indicada
como "Próxima acción prioritaria". Si no hay handoff, preguntame cuál tarea
priorizar. Validá con npm run build && npm run typecheck antes de commit.
```

### Prompt de salida para OpenCode (al finalizar sesión)

```
Generá un commit con GCP incluyendo [What], [Why], [How], [Next], [Validate],
[Files], [Agent]. Actualizá TASKS.md si completaste una tarea. Ejecutá
node scripts/git-handoff.js para generar el handoff de la sesión. No hagas
push a main; dejá la branch lista para revisión.
```

---

## 10. Métricas de Éxito del Workflow

| Métrica | Objetivo | Cómo medir |
|---|---|---|
| Tiempo de contexto | < 2 min para que OpenCode entienda estado | Tiempo desde "prompt de inicio" hasta primera acción útil |
| Tasa de commits GCP | 100% de commits feat/fix/ux/perf | `git log --grep='\[What\]' --oneline` vs total |
| Tareas sincronizadas | 100% de commits con tarea actualizada en TASKS.md | Revisión manual de Codex |
| Build pasando | 100% de push a origin | CI o script local |
| Handoffs generados | 1 por sesión de trabajo | Contar archivos en `docs/HANDOFF/` |

---

**Actualizado:** 2026-06-22
**Versión:** 1.0
**Autor:** Codex (workflow) / OpenCode (implementación)
