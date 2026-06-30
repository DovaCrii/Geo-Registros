---
name: codex-qa-check
description: "Validación de build, typecheck, tests, regresiones y archivos tocados. Usar después de cambios o antes de cerrar una tarea."
license: Apache-2.0
metadata:
  author: project
  version: "1.0"
---

## Activation Contract

Usar esta skill cuando la tarea principal sea verificar si un cambio quedó sano: compilación, tipado, tests, integración visible y riesgos de regresión.

## Hard Rules

- No corregir código salvo instrucción explícita del usuario.
- Ejecutar solo la validación mínima necesaria según el tipo de cambio.
- Reportar resultados por comando y diferenciar fallo real, warning y validación pendiente.
- No alterar configuración del proyecto para “hacer pasar” checks.

## Decision Gates

| Situación | Acción |
| --- | --- |
| Hubo cambios de código o configuración | Ejecutar checks relevantes |
| El usuario pide QA, validación, regresiones o revisión final | Activar esta skill |
| Solo se necesita análisis estructural sin checks | Derivar a `codex-project-review` |
| Se detecta un fallo pero no pidieron corregir | Reportar y detener |

## Execution Steps

1. Identificar qué archivos cambiaron y qué comportamiento podrían afectar.
2. Seleccionar checks mínimos suficientes: diff, typecheck, test, build u otros relevantes.
3. Ejecutar los comandos permitidos y revisar los archivos tocados.
4. Clasificar resultados en: pasa, falla o pendiente.
5. Recomendar la corrección o la siguiente validación.

## Output Contract

Devolver:
- Estado de QA por comando.
- Lista de fallos concretos.
- Riesgos de regresión detectados.
- Validaciones pendientes, si existen.

## References

- `AGENTS.md`
- Comandos del proyecto definidos en `AGENTS.md`