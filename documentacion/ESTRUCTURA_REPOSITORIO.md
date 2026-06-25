# ESTRUCTURA_REPOSITORIO.md

## Objetivo
Ordenar el repositorio sin romper la ejecución local.

## Estructura actual
- `README.md` y config raíz: entrada principal para usar el repo desde VS Code.
- `apps/web/`: aplicación Next.js full-stack actual.
- `backend/prisma/`: schema, migrations, seed y datos locales.
- `backend/storage/`: archivos y almacenamiento local del entorno.
- `documentacion/`: estado, roadmap, tareas, decisiones, bugs, handoffs y guías.
- `tooling/`: skills, registry y apoyo de OpenCode/Codex.
- `docs/`: documentación técnica legacy que todavía no se migró por completo.

## Estructura objetivo
- `apps/web/`: aplicación Next.js actual.
- `backend/`: Prisma, storage y documentación técnica backend.
- `documentacion/`: guías, roadmap, decisiones, bugs, estado del proyecto y documentación externa.
- `tooling/`: configuración de agentes, OpenCode, Codex, skills y herramientas IA.

## Regla de la migración
La app ya vive en `apps/web/`, pero el backend sigue dentro de Next.js por ahora para no romper Server Actions, Route Handlers, NextAuth ni Prisma.

## Flujo local recomendado
1. Abrir el repo en VS Code.
2. Ejecutar `npm run dev` desde la raíz.
3. Si cambia el esquema, correr `npm run prisma:generate`, `npm run prisma:migrate` y `npm run seed:dev`.
4. Validar con `npm run typecheck`, `npm run test` y `npm run build`.

## Nota de transición
Cuando `apps/web/` exista, el script raíz seguirá siendo el punto de entrada para la ejecución local. El cambio de carpeta debe ser estructural, no funcional.
