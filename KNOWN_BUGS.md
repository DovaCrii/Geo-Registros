# KNOWN_BUGS.md

| Bug | Ubicación | Severidad | Pasos para reproducir | Posible solución | Estado |
|---|---|---:|---|---|---|
| Divergencia entre README y datasource real de Prisma | `README.md` y `prisma/schema.prisma` | Media | Abrir el README y comparar con el datasource del esquema | Alinear documentación con el estado real o documentar explícitamente la diferencia | Abierto |
| Archivo local de base de datos sin seguimiento | `prisma/data/aeroflow.db` | Media | Ejecutar `git status --short` y observar el directorio no rastreado | Definir si debe ignorarse, versionarse o regenerarse como artefacto local | Abierto |
| Riesgo de memoria duplicada entre Engram y Codex | `.atl/skill-registry.md` y `AGENTS.md` | Alta | Revisar registros operativos de ambos sistemas | Mantener una sola fuente de verdad y usar Codex solo como apoyo | Mitigado por contrato operativo |

