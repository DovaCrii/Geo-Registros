# AGENTS.md

## Objetivo del proyecto
AeroFlow es una plataforma para operaciones de vuelos RPA/dron, con planificación de misiones, gestión documental, permisos, seguimiento geo-espacial y trazabilidad operativa.

## Stack detectado
- Next.js 15
- React 19
- TypeScript
- Prisma 6
- Vitest
- Tailwind CSS 3
- Autenticación con NextAuth
- MapLibre y TerraDraw para geometría interactiva
- Almacenamiento local de desarrollo en `prisma/data/aeroflow.db`

## Comandos disponibles
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`
- `npm run test`
- `npm run test:watch`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run seed:dev`

## Rol de OpenCode
- Herramienta principal de desarrollo y orquestación.
- Ejecuta la implementación, cambios de código y tareas amplias.
- Mantiene la memoria operativa mediante Engram.

## Rol de Codex
- Reviewer técnico.
- Planner corto para dividir solicitudes grandes en tareas pequeñas.
- QA para revisar build, lint, tipado, regresiones y cambios.
- Apoyo puntual de implementación solo si el usuario lo solicita explícitamente.

## Reglas de seguridad
- No modificar lógica de negocio salvo instrucción explícita del usuario.
- No instalar dependencias sin aprobación explícita.
- No borrar ni sobrescribir configuración existente de OpenCode.
- No modificar archivos de Engram ni duplicar su memoria.
- No cambiar estructura del proyecto salvo para configuración y documentación de Codex.
- No usar acceso completo como flujo normal.
- No configurar Codex como orquestador principal.

## Criterio de tarea terminada
- La tarea se considera terminada cuando el cambio está documentado, validado y no deja archivos nuevos sin registrar.
- Toda implementación debe quedar acompañada de revisión y QA cuando aplique.
- Si la tarea afecta comportamiento, debe existir verificación con build, typecheck o tests según corresponda.

## Uso de modelos
- Usar modelos rápidos para revisión, planeación breve y QA.
- Escalar a modelos más capaces solo cuando exista complejidad real o riesgo técnico.
- Preferir respuestas concisas, orientadas a acción y con hallazgos concretos.

## Uso de subagentes
- Usar subagentes solo para análisis paralelo cuando ayuden a reducir riesgo o tiempo.
- No usar subagentes para editar los mismos archivos en paralelo.
- Consolidar resultados antes de proponer o aplicar cambios.
- Evitar subagentes innecesarios para ahorrar uso del plan Plus.

## Regla de no duplicar Engram
- Engram es la memoria persistente del proyecto.
- Codex no debe guardar memoria duplicada, resúmenes paralelos ni estados redundantes.
- Si existe una decisión o contexto ya capturado por Engram, Codex debe referenciarlo y no recrearlo.

## Flujo recomendado OpenCode + Codex
1. OpenCode ejecuta el desarrollo principal.
2. Engram mantiene la memoria y el contexto persistente.
3. Codex revisa, planifica y audita.
4. Codex no debe guardar memoria duplicada.
5. Codex puede generar un handoff claro para que OpenCode ejecute la tarea principal.
6. Codex solo implementa si el usuario lo pide explícitamente.
7. Los subagentes de Codex solo se usan para análisis paralelo, no para editar los mismos archivos.

## Uso de subagentes en Codex
- Usar subagentes solo para revisión, QA, seguridad, frontend, backend o arquitectura.
- No usar subagentes para editar archivos en paralelo.
- Esperar a que todos los subagentes terminen antes de consolidar conclusiones.
- Evitar subagentes innecesarios para ahorrar uso del plan Plus.

## Prompts diarios
### Prompt de inicio
Revisa el estado actual del repo, detecta riesgos, resume el contexto útil y dime cuál es la siguiente tarea pequeña que conviene ejecutar con OpenCode.

### Prompt de revisión
Audita los cambios recientes, detecta regresiones, inconsistencias, deuda técnica y diferencias con el contrato operativo de AeroFlow.

### Prompt de QA
Verifica build, typecheck, tests y archivos modificados. Reporta solo fallos concretos, riesgos reales y pasos de validación pendientes.

### Prompt de handoff hacia OpenCode
Prepara un handoff breve y accionable para OpenCode con objetivo, archivos probables, pasos de implementación y criterio de aceptación.

### Prompt de cierre de sesión
Resume lo revisado hoy, lista decisiones o riesgos nuevos y deja una sola siguiente acción prioritaria para retomar mañana.

## Contexto optimizado para sesiones futuras
Leer primero y en este orden:
1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `ROADMAP.md`
4. `TASKS.md`
5. `docs/OPENCODE_HANDOFF.md`

Usar `docs/00_DOCUMENTATION_INDEX.md` solo cuando se necesite ubicar documentación extendida. Evitar pegar contexto largo en prompts; si falta contexto estable, actualizar estos documentos breves en vez de duplicarlo en la conversación.
