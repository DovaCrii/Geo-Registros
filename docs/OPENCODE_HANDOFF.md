# OPENCODE_HANDOFF.md

## Rol de OpenCode
OpenCode ejecuta implementación principal. Codex entrega planes, revisiones, QA y documentación.

## Contexto mínimo a leer
1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `ROADMAP.md`
4. `TASKS.md`
5. `docs/OPENCODE_HANDOFF.md`
6. `CHANGELOG.md` (últimos cambios)

## Estado actual del proyecto

| Área | Estado |
|---|---|
| **Visual system** (T-011) | ✅ Completo — light-first, tokens `slate-950`, 62 archivos normalizados |
| **Mission flow** (T-010) | ✅ Etapas 1, 3, 4 completas — wizard podado, redirects, progress bar |
| **Fase 4 DGAC** | ✅ Completa — permisos, docs, geometría, checklist alineados; FlowGuide 16 rutas |
| **Fase 5 (actual)** | 🚧 README orientación comercial, demo data (pendiente), handoff |
| **README** | Sincronizado con stack real (SQLite default), tagline comercial, progreso actual |
| **Home page** | Landing comercial completa (10 secciones) — no requiere cambios |

## Próxima tarea recomendada

**Fase 5 — Demo data y cierre comercial:**
1. Expandir `prisma/seed.cjs` para crear datos de ejemplo (cost centers, clients, drones, operators, flight plans con geometría y documentos).
2. El seed debe funcionar con `SEED_DEMO=true` o similar para no interferir con el seed normal de admin.

## Alcance sugerido
- `prisma/seed.cjs` — agregar bloque condicional `if (process.env.SEED_DEMO === "true")` con datos demo.
- Datos chilenos realistas: cost centers tipo "Minería Norte", "Construcción Santiago Sur", etc.
- 3-5 flight plans con distintos estados del flujo de permisos.
- Geometría GeoJSON simple (polígonos alrededor de Santiago/Chile).
- Documentos de referencia (sin archivos reales, solo registros).
- Mantener `ROADMAP.md`, `TASKS.md` y `docs/AI_PROGRESS_LOG.md` sincronizados.

## Criterio de aceptación
- Cambio acotado y reversible.
- `SEED_DEMO` debe ser opt-in explícito.
- No modificar lógica de negocio existente ni schema de Prisma.
- Validar con `npm run typecheck && npm run build`.

## Prompt corto
Lee `AGENTS.md`, `ROADMAP.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md`. Implementá Fase 5: agrega datos demo al seed script, actualiza documentación y deja el proyecto listo para demostraciones comerciales.
