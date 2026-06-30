# AGENTS.md

## Propósito
AeroFlow es una plataforma para operaciones de vuelos RPA/dron: planificación de misiones, gestión documental, permisos, seguimiento geo-espacial y trazabilidad operativa.

Este archivo define cómo deben trabajar los agentes en el repo sin bloquear tareas normales. La regla principal es simple: **avanzar con cambios seguros, pedir permiso cuando haya riesgo real y dejar evidencia verificable**.

## Stack del proyecto
- Next.js 15
- React 19
- TypeScript
- Prisma 6
- Vitest
- Tailwind CSS 3
- NextAuth
- MapLibre y TerraDraw para geometría interactiva
- SQLite local de desarrollo en `prisma/data/aeroflow.db`

## Comandos útiles
- Desarrollo: `npm run dev`
- Build: `npm run build`
- Producción local: `npm run start`
- Tipado: `npm run typecheck`
- Tests: `npm run test`
- Tests watch: `npm run test:watch`
- Prisma generate: `npm run prisma:generate`
- Prisma migrate: `npm run prisma:migrate`
- Seed dev: `npm run seed:dev`

## Modo de trabajo recomendado
1. Leer primero `AGENTS.md`, `DECISIONS.md` y `KNOWN_BUGS.md` si existen.
2. Revisar estado del repo antes de editar: `git status --short`.
3. Mantener cambios chicos, verificables y fáciles de revertir.
4. Si la tarea afecta comportamiento, acompañarla con typecheck, test o build según corresponda.
5. Reportar solo lo importante: qué cambió, cómo se verificó y qué queda pendiente.

## Roles

### OpenCode
- Orquestador principal de desarrollo.
- Ejecuta tareas amplias de implementación.
- Mantiene memoria operativa mediante Engram.

### Codex
- Reviewer técnico, planner corto y apoyo de QA.
- Puede implementar cambios puntuales cuando el usuario lo pide o cuando la tarea sea pequeña y de bajo riesgo.
- Debe evitar convertirse en orquestador principal si OpenCode está llevando la implementación.

## Permisos por defecto

### Se puede hacer sin pedir permiso
- Leer archivos del repo.
- Editar documentación, configuración local del propio agente y cambios mecánicos de bajo riesgo.
- Refactors pequeños que no cambien comportamiento observable.
- Ejecutar comandos de verificación locales que no instalen dependencias ni modifiquen datos importantes.
- Crear handoffs, planes cortos, revisiones y reportes de QA.

### Pedir permiso antes
- Instalar, actualizar o remover dependencias.
- Ejecutar migraciones que modifiquen datos persistentes.
- Cambiar contratos de dominio, flujos críticos, permisos, autenticación o modelo de datos.
- Borrar archivos, mover carpetas grandes o reestructurar el proyecto.
- Usar comandos destructivos o acceso fuera del workspace.

### No hacer
- No agregar `Co-Authored-By` ni atribución de IA en commits.
- No sobrescribir cambios del usuario sin verificar `git status`.
- No modificar archivos internos de Engram ni duplicar su memoria.
- No borrar configuración existente de OpenCode.
- No hacer cambios masivos si una tarea pequeña resuelve el problema.

## Criterio de tarea terminada
Una tarea está lista cuando:
- El cambio solicitado está aplicado o el bloqueo está explicado.
- No quedan archivos nuevos o modificados sin mencionar.
- Se ejecutó la validación adecuada, o se explica por qué no se ejecutó.
- Si hubo decisión técnica nueva, queda documentada donde corresponda.

## Validación sugerida
- Cambios de documentación: revisar diff.
- Cambios TypeScript/React: `npm run typecheck` y tests relevantes.
- Cambios de UI: typecheck + revisión visual cuando aplique.
- Cambios Prisma/modelo de datos: `npm run prisma:generate`, tests relevantes y cuidado con migraciones.
- Cambios amplios: `npm run build` antes de cerrar.

## Uso de subagentes
- Usarlos solo cuando reduzcan riesgo o contexto: revisión, QA, seguridad, frontend, backend o arquitectura.
- No usar subagentes para editar los mismos archivos en paralelo.
- Esperar y consolidar resultados antes de decidir o reportar.
- Evitarlos para tareas chicas donde agregan más fricción que valor.

## Engram
- Engram es la memoria persistente del proyecto.
- No crear resúmenes paralelos si la información ya está en Engram.
- Si se descubre una decisión, convención, bugfix o hallazgo no obvio, guardarlo en Engram cuando la herramienta esté disponible.

## Commits
- Usar conventional commits.
- No incluir `Co-Authored-By`.
- No commitear sin revisar el diff.
- No mezclar cambios no relacionados en el mismo commit.

## Prompts útiles

### Inicio
Revisa el estado actual del repo, detecta riesgos, resume el contexto útil y dime cuál es la siguiente tarea pequeña que conviene ejecutar.

### Revisión
Audita los cambios recientes, detecta regresiones, inconsistencias, deuda técnica y diferencias con el contrato operativo de AeroFlow.

### QA
Verifica build, typecheck, tests y archivos modificados. Reporta solo fallos concretos, riesgos reales y pasos de validación pendientes.

### Handoff hacia OpenCode
Prepara un handoff breve y accionable para OpenCode con objetivo, archivos probables, pasos de implementación y criterio de aceptación.

### Cierre
Resume lo revisado hoy, lista decisiones o riesgos nuevos y deja una sola siguiente acción prioritaria para retomar mañana.

## Contexto para sesiones futuras
Leer primero y en este orden:
1. `AGENTS.md`
2. `DECISIONS.md`
3. `KNOWN_BUGS.md`

Mantener el contexto corto. Si un documento no ayuda a decidir o verificar, no cargarlo.
