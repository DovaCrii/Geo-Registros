---
name: opencode-handoff
description: "Prepara un handoff breve y accionable para OpenCode con objetivo, alcance, archivos probables y criterio de aceptación."
license: Apache-2.0
metadata:
  author: project
  version: "1.0"
---

## Activation Contract

Usar esta skill cuando Codex ya revisó, planificó o validó una tarea y se necesita transferir ejecución o contexto útil a OpenCode sin duplicar memoria.

## Hard Rules

- El handoff debe ser breve, accionable y centrado en ejecución.
- No reescribir todo el análisis previo si no agrega valor.
- No asumir rol de orquestador global.
- No duplicar memoria persistente que ya deba vivir en Engram.

## Decision Gates

| Situación | Acción |
| --- | --- |
| Ya hay una tarea clara y otro agente debe ejecutarla | Activar esta skill |
| Falta definir alcance o criterio de aceptación | Volver a `codex-task-planner` |
| El usuario pidió revisión o QA, no transferencia | Usar la skill específica |
| El handoff quedó largo o teórico | Comprimirlo a instrucciones accionables |

## Execution Steps

1. Resumir objetivo y alcance en pocas líneas.
2. Listar archivos probables o áreas afectadas.
3. Incluir restricciones, riesgos y qué evitar.
4. Definir criterio de aceptación y validación esperada.
5. Entregarlo en formato directo para ejecución.

## Output Contract

Devolver:
- Objetivo.
- Alcance.
- Archivos probables.
- Restricciones.
- Criterio de aceptación.

## References

- `AGENTS.md`
- `codex-task-planner`