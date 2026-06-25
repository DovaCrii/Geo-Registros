# Skill Registry — AeroFlow / Geo-Registros

## Project Identity
- **Name:** AeroFlow (formerly Geo-Registros)
- **Type:** Next.js 15 full-stack — Drone/RPA operations management
- **Stack:** Next.js, React 19, TypeScript, Prisma, SQLite, MapLibre, TerraDraw
- **Root:** C:\Users\cmunoz\Geo-Registros
- **Repo:** https://github.com/DovaCrii/Geo-Registros.git

## Detection Patterns

| Trigger | Path / Pattern | Skill |
|---------|---------------|-------|
| Next.js project | `apps/web/next.config.ts`, `apps/web/src/app/` | sdd-init |
| Prisma schema | `backend/prisma/schema.prisma` | sdd-init |
| MapLibre usage | `maplibre-gl`, `@watergis/maplibre-gl-terradraw` | sdd-explore |
| GeoJSON patterns | `geometryJson`, `GeoJSON` | sdd-explore |
| Docker Compose | `docker-compose.yml` | sdd-init |
| TailwindCSS | `apps/web/tailwind.config.ts` | sdd-init |
| Vitest config | `apps/web/vitest.config.ts` | sdd-init |

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
