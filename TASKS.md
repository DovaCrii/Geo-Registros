# TASKS.md

| ID | Título | Prioridad | Herramienta recomendada | Archivos probables | Criterio de aceptación | Validación esperada |
|---|---|---:|---|---|---|---|
| T-001 | Sincronizar documentación operativa OpenCode + Codex | Alta | Codex | `AGENTS.md`, `PROJECT_STATE.md` | El contrato operativo queda claro y sin ambigüedad | Revisión manual de contenido |
| T-002 | Revisar divergencia entre README y Prisma actual | Alta | Codex | `README.md`, `prisma/schema.prisma`, `PROJECT_STATE.md` | Queda documentada la diferencia entre objetivo y estado real | Confirmación documental |
| T-003 | Alinear decisiones técnicas estables | Media | OpenCode | `DECISIONS.md`, `docs/` | Las decisiones clave quedan registradas con fecha y motivo | Revisión de consistencia |
| T-004 | Mantener inventario de bugs conocidos | Media | Codex | `KNOWN_BUGS.md`, `src/` | Cada bug tiene reproducción, severidad y estado | Revisión de trazabilidad |
| T-005 | Preparar handoff para cambios grandes | Media | Codex | `TASKS.md`, `AGENTS.md` | Existe una tarea pequeña y delegable para OpenCode | Handoff claro y accionable |
| T-006 | Validar cambios con QA técnico | Alta | Codex | Archivos modificados, `package.json` | Build, typecheck o tests definidos según el cambio | `npm run typecheck`, `npm run test`, `npm run build` según aplique |
| T-007 | Implementar feature aprobado por usuario | Alta | OpenCode | Según tarea | Cambio implementado sin tocar Engram ni config ajena | Validación específica de la tarea |
| T-008 | Revisar arquitectura y riesgos del repo | Media | Codex | `src/`, `prisma/`, `docs/` | Se identifican riesgos y dependencias críticas | Informe de revisión |
| T-009 | Consolidar contexto corto para IA | Alta | Codex | `PROJECT_STATUS.md`, `ROADMAP.md`, `docs/OPENCODE_HANDOFF.md` | Las sesiones futuras pueden arrancar leyendo 5 archivos | Revisión manual |
| T-010 | Planificar rediseño gradual del flujo de misión | Alta | OpenCode | `docs/UX_WORKFLOW_MASTER_PLAN.md`, `src/app/flight-plans/` | Existe una tarea pequeña para mejorar el wizard sin refactor global | Handoff aprobado |
| T-011 | Definir y aplicar sistema visual base | Alta | OpenCode | `docs/DESIGN_SYSTEM_PLAN.md`, `src/app/globals.css`, `src/components/ui/` | Tokens y patrones visuales quedan definidos y aplicados de forma gradual antes de rediseñar pantallas | `npm run typecheck` |
| T-012 | Actualizar bitácora de avance IA | Media | Codex | `docs/AI_PROGRESS_LOG.md` | Cada sesión deja objetivo, cambios, decisiones y próxima tarea | Revisión manual |
