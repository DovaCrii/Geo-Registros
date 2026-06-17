# DECISIONS.md

| Fecha | Decisión | Motivo | Impacto | Herramienta involucrada |
|---|---|---|---|---|
| 2026-06-17 | OpenCode es la herramienta principal de desarrollo | El usuario pidió una orquestación secundaria para Codex sin reemplazar el flujo actual | Evita duplicar responsabilidades y mantiene una sola ruta de ejecución | OpenCode + Codex |
| 2026-06-17 | Engram sigue siendo la memoria persistente del proyecto | Se requiere no duplicar contexto ni estados en Codex | Mantiene una única fuente de verdad para memoria operativa | Engram |
| 2026-06-17 | Codex se limita a revisión, planificación breve, QA y auditoría | El objetivo es apoyo controlado, no orquestación principal | Reduce riesgo de cambios amplios y mantiene el flujo estable | Codex |
| 2026-06-17 | La configuración de Codex se mantiene en workspace-write y sin red | El uso debe ser controlado y seguro | Limita efectos colaterales y evita dependencias externas | Codex |
| 2026-06-17 | El estado detectado de Prisma se documenta como SQLite local | El esquema actual apunta a `sqlite` y al archivo local `prisma/data/aeroflow.db` | Evita confundir el estado real con el objetivo descrito en README | Codex |
| 2026-06-17 | La documentacion corta sera la entrada principal para IA | Evita prompts largos y reduce consumo de contexto | Futuras sesiones deben leer `AGENTS.md`, `PROJECT_STATUS.md`, `ROADMAP.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md` | Codex + OpenCode |
