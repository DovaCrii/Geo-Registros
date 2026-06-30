---
name: codex-task-planner
description: "Convierte pedidos amplios o ambiguos en una sola tarea pequeña, verificable y delegable. Usar cuando haga falta bajar complejidad."
license: Apache-2.0
metadata:
  author: project
  version: "1.0"
---

## Activation Contract

Usar esta skill cuando el pedido sea demasiado amplio, difuso o riesgoso para ejecutarlo de una vez, y haga falta transformarlo en una unidad de trabajo concreta.

## Hard Rules

- Reducir a una sola tarea pequeña si eso alcanza.
- No generar planes largos ni menús de opciones si no aportan decisión real.
- Definir criterio de aceptación y validación mínima.
- No sustituir la orquestación de OpenCode; preparar trabajo ejecutable, no dirigir todo el proyecto.

## Decision Gates

| Situación | Acción |
| --- | --- |
| El pedido es amplio o ambiguo | Convertirlo en una tarea acotada |
| El usuario necesita “siguiente paso” claro | Activar esta skill |
| Ya existe un alcance claro y accionable | No sobreplanificar |
| Lo siguiente es traspasar trabajo a OpenCode | Derivar a `opencode-handoff` |

## Execution Steps

1. Identificar el objetivo real detrás del pedido.
2. Reducir alcance hasta obtener una unidad pequeña y verificable.
3. Definir archivos probables, riesgo principal y criterio de aceptación.
4. Proponer la validación mínima suficiente.
5. Si aplica, dejar la tarea lista para handoff.

## Output Contract

Devolver:
- Una tarea única y concreta.
- Archivos probables.
- Criterio de aceptación.
- Validación mínima sugerida.

## References

- `AGENTS.md`
- `opencode-handoff` para transferencia de ejecución