---
name: codex-safe-implementation
description: "Implementación puntual y de bajo riesgo cuando el usuario pide editar directamente. Mantener alcance mínimo, trazabilidad y validación posterior."
license: Apache-2.0
metadata:
  author: project
  version: "1.0"
---

## Activation Contract

Usar esta skill solo cuando el usuario pida explícitamente que Codex implemente cambios y el alcance sea pequeño, controlado y compatible con el contrato operativo del repo.

## Hard Rules

- No implementar cambios grandes ni reestructuras amplias.
- Mantener el alcance mínimo necesario para resolver el pedido.
- Revisar el estado del repo antes de editar para no mezclar cambios ajenos.
- Acompañar toda implementación con validación posterior o explicación clara de por qué no se ejecutó.
- No convertir a Codex en el flujo principal si OpenCode debe llevar la tarea mayor.

## Decision Gates

| Situación | Acción |
| --- | --- |
| El usuario pide implementar directamente | Activar esta skill |
| El cambio es pequeño y verificable | Proceder con edición acotada |
| El cambio es amplio, ambiguo o riesgoso | Reducir alcance o derivar a planificación/handoff |
| La tarea principal es solo revisar o validar | Derivar a la skill específica |

## Execution Steps

1. Verificar el pedido exacto y confirmar que requiere edición directa.
2. Revisar el estado del repo y aislar solo los archivos relacionados.
3. Aplicar el cambio mínimo suficiente.
4. Revisar diff y coherencia con el contrato operativo.
5. Ejecutar o proponer la validación necesaria.

## Output Contract

Devolver:
- Qué se cambió.
- Archivos tocados.
- Validación ejecutada o pendiente.
- Riesgos o límites del cambio.

## References

- `AGENTS.md`
- `codex-qa-check` para validación posterior