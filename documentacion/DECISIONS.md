# DECISIONS.md

| Fecha | Decisión | Motivo | Impacto | Herramienta involucrada |
|---|---|---|---|---|
| 2026-06-17 | OpenCode es la herramienta principal de desarrollo | El usuario pidió una orquestación secundaria para Codex sin reemplazar el flujo actual | Evita duplicar responsabilidades y mantiene una sola ruta de ejecución | OpenCode + Codex |
| 2026-06-17 | Engram sigue siendo la memoria persistente del proyecto | Se requiere no duplicar contexto ni estados en Codex | Mantiene una única fuente de verdad para memoria operativa | Engram |
| 2026-06-17 | Codex se limita a revisión, planificación breve, QA y auditoría | El objetivo es apoyo controlado, no orquestación principal | Reduce riesgo de cambios amplios y mantiene el flujo estable | Codex |
| 2026-06-17 | La configuración de Codex se mantiene en workspace-write y sin red | El uso debe ser controlado y seguro | Limita efectos colaterales y evita dependencias externas | Codex |
| 2026-06-17 | El estado detectado de Prisma se documenta como SQLite local | El esquema actual apunta a `sqlite` y al archivo local `prisma/data/aeroflow.db` | Evita confundir el estado real con el objetivo descrito en README | Codex |
| 2026-06-17 | La documentacion corta sera la entrada principal para IA | Evita prompts largos y reduce consumo de contexto | Futuras sesiones deben leer `AGENTS.md`, `documentacion/PROJECT_STATUS.md`, `documentacion/ROADMAP.md`, `documentacion/TASKS.md` y `documentacion/OPENCODE_HANDOFF.md` | Codex + OpenCode |
| 2026-06-18 | Tema claro como experiencia primaria, dark mode como secundario | Consistencia visual, la mayoría de los usuarios opera en interiores con buena luz | Todos los componentes usan colores base light-first con `dark:` prefix para override | Tailwind CSS |
| 2026-06-18 | `headerContent` para contenido diferente en header vs body de tablas | DataColumn compartido necesita checkbox de selección en header pero no en body | `DataColumn.headerContent?: ReactNode` permite header distinto al string `header` | TypeScript |
| 2026-06-18 | SQLite para desarrollo local, PostgreSQL + PostGIS para producción | SQLite elimina dependencias Docker para el día a día; PostGIS se reserva para consultas espaciales reales en producción | Schema Prisma preparado para migrar sin cambios de modelo; `.env.example` documenta ambas opciones | Prisma |
| 2026-06-18 | Wizard con solo pasos accionables | Pasos informativos sin interacción frustran al usuario y alargan el flujo innecesariamente | El wizard pasó de 6 a 4 pasos; la documentación y checklist DGAC se gestionan en la página de detalle | Next.js |
| 2026-06-18 | Creación y actualización redirigen al detalle, no al listado | El usuario pierde contexto al volver al listado después de crear o guardar | `createFlightPlan` → `/flight-plans/{id}?tab=2`; `updateFlightPlan` → `/flight-plans/{id}` | Next.js |
| 2026-06-18 | Build antes que typecheck para evitar race condition | `.next/types` se regenera en build; typecheck sin build previo falla por tipos faltantes | Secuencia: `npm run build && npm run typecheck` | Next.js + TypeScript |
| 2026-06-18 | Restaurar `tsconfig.tsbuildinfo` del HEAD tras validación | El archivo se regenera en cada build y ensucia el working tree | `git restore --source=HEAD --worktree --staged -- tsconfig.tsbuildinfo` | Git |
