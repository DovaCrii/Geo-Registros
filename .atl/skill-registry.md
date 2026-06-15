# Skill Registry — AeroFlow

## Project Identity
- **Name:** AeroFlow (formerly Geo-Registros)
- **Type:** Next.js 15 full-stack — Drone/RPA operations management
- **Stack:** Next.js, React 19, TypeScript, Prisma, PostgreSQL/PostGIS, MapLibre, TerraDraw, Turf.js
- **Root:** D:\OneDrive - J.E.J. Ingeniería S.A\I+D\geo-registros
- **Repo:** https://github.com/DovaCrii/Geo-Registros.git

## Detection Patterns

| Trigger | Path / Pattern | Skill |
|---------|---------------|-------|
| Next.js project | `next.config.ts`, `src/app/` | sdd-init |
| Prisma schema | `prisma/schema.prisma` | sdd-init |
| MapLibre usage | `maplibre-gl`, `@watergis/maplibre-gl-terradraw` | sdd-explore |
| GeoJSON patterns | `geometryJson`, `GeoJSON` | sdd-explore |
| Docker Compose | `docker-compose.yml` | sdd-init |
| TailwindCSS | `tailwind.config.ts` | sdd-init |

## Available Skills

| Skill | Purpose |
|-------|---------|
| sdd-init | Initialize SDD context |
| sdd-explore | Read-only codebase investigation |
| sdd-propose | Change proposals |
| sdd-spec | Acceptance criteria |
| sdd-design | Implementation design |
| sdd-tasks | Task breakdown |
| sdd-apply | Code implementation |
| sdd-verify | Validation |
| sdd-archive | Close and preserve |

## Engram Context
- Semantic memory: `AeroFlow` (importance 0.9)
- Contains: project identity, stack, modules, architecture, next steps
- Mode: `engram` only (no openspec/)
