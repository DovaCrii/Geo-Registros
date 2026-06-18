# GPT-5.5 Import Brief — AeroFlow / Geo-Registros

## Rol

Actúa como arquitecto senior de producto, UX lead, technical writer y project manager.

## Objetivo

Mejorar el plan del proyecto, ordenar seguimiento futuro y actualizar la documentación de GitHub para que OpenCode pueda usarla como fuente de verdad.

## Contexto

AeroFlow / Geo-Registros es una plataforma para operaciones RPA/drones:

- planificación de misiones;
- permisos DGAC/SIGO;
- documentos;
- mapa y geometría;
- trazabilidad;
- bitácora;
- workflow operacional.

**OpenCode** será el ejecutor principal.
**GPT-5.5 / Codex** será planificador, revisor y documentador.

## Problema actual

El proyecto necesita:

- mejor documentación viva;
- roadmap claro;
- plan UX visual;
- tracking de avance;
- handoff para OpenCode;
- menos prompts largos;
- fuente de verdad dentro del repo.

## Archivos que debe revisar

Leer solo lo necesario:

- `README.md`
- `package.json`
- `tailwind.config.ts`
- `AGENTS.md` si existe
- `ROADMAP.md` si existe
- `TASKS.md` si existe
- `DECISIONS.md` si existe
- `PROJECT_STATUS.md` si existe
- `docs/`
- estructura general de `src/`

## Archivos que debe crear o actualizar

- `AGENTS.md`
- `PROJECT_STATUS.md`
- `ROADMAP.md`
- `TASKS.md`
- `DECISIONS.md`
- `CHANGELOG.md`
- `docs/00_DOCUMENTATION_INDEX.md`
- `docs/UX_WORKFLOW_MASTER_PLAN.md`
- `docs/DESIGN_SYSTEM_PLAN.md`
- `docs/COMPETITOR_BENCHMARK.md`
- `docs/OPENCODE_HANDOFF.md`
- `docs/AI_PROGRESS_LOG.md`

## Reglas

- No modificar lógica de negocio.
- No instalar dependencias.
- No tocar Prisma.
- No cambiar base de datos.
- No refactorizar.
- No rediseñar pantallas todavía.
- Priorizar documentación, planificación y seguimiento.
- No duplicar información.
- Mantener documentos claros y accionables.
- Cada documento debe servir para trabajo futuro de OpenCode.

## Resultado esperado

Dejar el repo con:

- índice documental;
- estado maestro del proyecto;
- roadmap por fases;
- plan UX/workflow;
- plan visual;
- benchmark de competencia;
- tareas pequeñas para OpenCode;
- bitácora de avance;
- changelog;
- README actualizado;
- prompt corto para OpenCode.

## Primera prioridad

Crear una base documental sólida para que futuras sesiones usen prompts cortos y lean solo:

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `ROADMAP.md`
4. `TASKS.md`
5. `docs/OPENCODE_HANDOFF.md`

---

## Prompt corto para Codex (después de crear este archivo)

> Lee `docs/ai/GPT55_IMPORT_BRIEF.md` y ejecútalo por fases.
> No cargues todo el repo completo.
> No edites código de negocio.
> Primero actualiza documentación y seguimiento.
> Al final entrega resumen breve, archivos modificados y próxima tarea para OpenCode.

## Prompt aún más corto (sesiones futuras)

> Lee `AGENTS.md`, `PROJECT_STATUS.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md`.
> Ejecuta la próxima tarea documental pendiente.
> No edites código.
> Actualiza `docs/AI_PROGRESS_LOG.md`.
