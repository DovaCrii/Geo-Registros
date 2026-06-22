# Plan UX/UI Operacional — AeroFlow

## Principios de diseño
1. **Seguridad antes que estética:** El color comunica estado operacional, no decoración.
2. **Campo primero:** Todo debe funcionar en tablet, con sol, con guantes, con poca batería.
3. **Contexto sin salir:** La normativa DGAC debe estar a un click o hover, no en otra página.
4. **Acción inmediata:** Los empty states proponen el siguiente paso, no solo informan.
5. **Minimalismo disciplinado:** usar primero primitives nativas de React/Next/Browser; si algo no agrega valor real, se omite y se documenta el límite. Referencia externa: Ponytail.

## Sistema de colores semánticos
| Estado | Tailwind | Significado operacional |
|--------|----------|------------------------|
| DRAFT | slate | Planificación |
| IN_REVIEW | amber | Espera DGAC |
| AUTHORIZED | emerald | Listo para volar |
| REJECTED | rose | No operable |
| CLOSED | zinc | Archivado |

## Jerarquía de información
1. ¿Puedo volar hoy? (semáforo + clima + vigencias)
2. ¿Qué misión sigue? (panel operativo)
3. ¿Qué necesito completar? (checklist + wizard)
4. ¿Qué pasó? (timeline + auditoría)

## Roadmap UX/UI
Ver `ROADMAP.md` Fase 10 y `TASKS.md` T-024 a T-035.

## Tarea
ID: [T-XXX]
Título: [descripción]

## Estado
- [ ] En progreso
- [ ] En revisión
- [ ] Completada

## Criterio de aceptación
- [ ] Criterio 1
- [ ] Criterio 2

## Validación técnica
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Smoke test manual

## Commit relacionado
[hash o rama]

## Notas
[Notas breves sobre decisiones, hallazgos y próximos pasos.]

## Planificación — 2026-06-19
- Planificación de Fase 10 (UX/UI Operacional) y Fase 11 (Trazabilidad).
- Creación de tareas T-024 a T-035 con estimaciones.
- Documentación de sistema de colores semánticos.
- Definición de principios de diseño campo-primero.
