---
name: codex-project-review
description: "Revisión de arquitectura, riesgos y consistencia del repositorio sin editar código. Usar antes de cambios importantes o cuando haya dudas estructurales."
license: Apache-2.0
metadata:
  author: project
  version: "1.0"
---

## Activation Contract

Usar esta skill cuando la tarea principal sea entender el estado del proyecto, detectar riesgos o revisar coherencia entre código, estructura y documentación sin implementar cambios.

## Hard Rules

- Modo solo lectura: no editar archivos, no instalar dependencias y no ejecutar cambios destructivos.
- Priorizar arquitectura, puntos de acoplamiento, contratos rotos, deuda técnica y contradicciones operativas.
- Reportar evidencia concreta: archivo, área afectada, riesgo y consecuencia.
- No reemplazar QA ni planificación; si el problema principal es validación o división de trabajo, derivar a la skill correspondiente.

## Decision Gates

| Situación | Acción |
| --- | --- |
| Hay dudas sobre arquitectura o coherencia del repo | Revisar estructura, contratos y dependencias |
| El usuario pide “auditar”, “revisar”, “detectar riesgos” o similar | Activar esta skill |
| La tarea requiere editar código | Detener revisión y derivar a implementación segura |
| La principal necesidad es ejecutar checks | Derivar a `codex-qa-check` |

## Execution Steps

1. Identificar el área o flujo bajo revisión.
2. Leer solo los archivos necesarios para entender estructura, dependencias y contratos.
3. Detectar riesgos, inconsistencias, deuda técnica o decisiones confusas.
4. Priorizar hallazgos por impacto y probabilidad.
5. Recomendar un siguiente paso concreto y acotado.

## Output Contract

Devolver:
- Resumen ejecutivo corto.
- Hallazgos priorizados.
- Riesgos concretos con evidencia.
- Siguiente paso recomendado.

## References

- `AGENTS.md`
- `DECISIONS.md`
- `KNOWN_BUGS.md`