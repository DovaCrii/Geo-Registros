# AeroFlow

**Platform for drone/RPA flight operations, geo-registration, technical deliverables, and operational compliance — from mission planning to report delivery in a single traceable workflow.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite)](https://www.sqlite.org/)
[![MapLibre](https://img.shields.io/badge/MapLibre-4-7CB342?logo=maplibre)](https://maplibre.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Commercial-red.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](.)

---

## Current snapshot

| Product state | Current focus | Branches to review |
|---|---|---|---|
| Production-ready platform with operational modules, visual system, and contextual guidance | UX polish, workflow DGAC alignment, and commercial readiness | `ux-dgac-login-fix` |

### Current highlights

- Visual system fully applied (light-first, dark mode secondary) — all components, modules, and pages normalized to `slate-950` dark surfaces.
- Mission flow redesigned: wizard pruned from 6 to 4 actionable steps, creation redirects to detail with progress bar.
- Permissions, documents, geometry, and checklist modules aligned with the design system and fully localized to Spanish.
- Contextual help (FlowGuide) covers 16 routes with step-by-step guidance and operational tips.
- Commercial landing page with industry use cases (mining, construction, infrastructure, environment, surveying, inspection) and before/after comparison.

### Review this first

1. [`CHANGELOG.md`](CHANGELOG.md)
2. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
3. [`ROADMAP.md`](ROADMAP.md)
4. [`TASKS.md`](TASKS.md)
5. [`docs/OPENCODE_HANDOFF.md`](docs/OPENCODE_HANDOFF.md)

---

## Concept

> **AeroFlow centralizes RPA/drone flight operations into a single platform — from mission planning and interactive mapping to document tracking, permission workflows, and operational history.**

Today, managing drone permits, flight logs, aircraft documents, operator credentials, and mission geometry often means juggling emails, spreadsheets, PDFs, KML files, and shared folders. AeroFlow replaces that fragmentation with a structured, visual, and traceable platform.

**What makes AeroFlow different:**

- **Permission-first workflow** — Full state machine for DGAC/SIGO approvals (draft → review → sent → authorized → rejected → closed)
- **Map as a tool, not a decoration** — Draw zones, measure areas, mark no-fly zones, save GeoJSON directly from the browser
- **Weather-aware planning** — Automatic wind, temperature, and precipitation data via free APIs (Open-Meteo)
- **Process guidance** — Built-in helper that tells you what's missing, what's next, and how to complete each step
- **Document-centric** — Every mission carries its document package: permits, insurance, checklists, logbooks, KMZ files
- **Audit trail** — Every state change, document upload, and communication is logged with who, when, and why
- **Learning journey** — The project itself is documented as it grows, with decisions, trade-offs, and lessons learned alongside the code

---

## Entity model

```mermaid
flowchart TD
  CC[CostCenter\n(cost center)]
  DR[Drone\n(fleet)]
  CL[Client\n(customer)]
  OP[Operator\n(pilot / RPA)]

  MS[Mission / FlightPlan\n(operational workflow)]
  GE[Geometry\n(GeoJSON)]
  DO[Documents\n(permits, checklists, files)]
  WE[Weather\n(Open-Meteo)]
  HS[Status history\n(audit trail)]

  CC --> MS
  DR --> MS
  CL --> MS
  OP --> MS

  MS --> GE
  MS --> DO
  MS --> WE
  MS --> HS
```

> Central idea: one mission ties together the operational context, geometry, documents, weather, and audit history.

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) + React 19 | SSR, server actions, file-based routing, full-stack monorepo |
| **Styling** | TailwindCSS 3 + shadcn/ui (planned) | Utility-first, consistent design system, dark theme native |
| **Backend** | Next.js server actions + route handlers | Monorepo without premature backend separation |
| **Database** | SQLite (dev) · PostgreSQL 16 + PostGIS 3.4 (prod, planned) | SQLite para desarrollo local sin dependencias; PostGIS para consultas espaciales en producción |
| **ORM** | Prisma 6 | Type-safe queries, schema-first, migration pipeline |
| **Map** | MapLibre GL JS 4 | Open-source, no API keys, WebGL rendering |
| **Drawing** | TerraDraw via @watergis/maplibre-gl-terradraw | Point, polygon, line, circle, select — interactive editing |
| **Geo analysis** | Turf.js (planned) | Area/perimeter/distance measurements, spatial operations |
| **Formats** | toGeoJSON, tokml, dxf-parser/writer | KML and DXF import/export without heavy dependencies |
| **Weather** | Open-Meteo API (free, no key) | Wind, temperature, precipitation for mission planning |
| **PDF** | react-pdf / pdf-lib (planned) | Export mission sheets, reports, permit packages |
| **Storage** | Local-first (MinIO/S3 future) | Document uploads with prepared adapter |
| **Local dev** | SQLite directo (default) · Docker Compose (PostgreSQL opcional) | Sin Docker para el día a día; `docker compose up -d` cuando se necesita PostGIS |
| **Auth** | Scaffolded roles (8 roles) — full auth planned | Ready for credential-based or OIDC login |

---

## Project progress

| Block | Status | What it delivers |
|---|---|---|---|
| **Foundation** | ✅ Done | Next.js + TypeScript + Tailwind + Prisma + Docker + folder structure |
| **Master Data** | ✅ Done | CostCenter, Client, Drone, Operator CRUD + soft delete + configurable list views with filters, sorting, and pagination |
| **Mission (Flight Plan)** | ✅ Done | Create, edit, list flight plans with required relations + soft delete |
| **Geometry boundary** | ✅ Done | GeoJSON validation, storage, type inference, edit support |
| **Map editing** | ✅ Done | MapLibre + TerraDraw: draw points, lines, polygons interactively |
| **KML / DXF** | 🚧 Libraries ready | Import and export infrastructure prepared |
| **Permission workflow** | ✅ Done | Full state machine (10 states), history log, document association, timeline |
| **Weather integration** | ✅ Done | Open-Meteo API: wind, temp, precipitation on mission detail |
| **Process helper** | ✅ Done | Contextual flow guidance panel (FlowGuide) |
| **Document management** | ✅ Done | Upload, list, remove per flight plan with storage adapter |
| **Dashboard** | ✅ Done | KPIs: flight plans by status, active drones/operators, pending docs, weather chart |
| **Reports & export** | ✅ Done | Mission PDF, dashboard report (PDF + Excel) |
| **Notifications** | ✅ Done | Paginated panel + unread badge, server actions |
| **Auth & roles** | ✅ Done | Email/password + NextAuth, 8 roles, middleware + server-side gate |
| **Soft delete** | ✅ Done | All master entities + flight plans preserve historical links |
| **Configurable lists** | ✅ Done | Column configs, filters, sidebar, sorting — all data-driven |
| **Email tracking** | ✅ Done | Send log with Resend, auto-logging, admin list, detail, resend failed, linked to flight plans, sidebar |
| **Vigency control** | ✅ Done | insuranceExpiry / licenseExpiry fields, form dates, list indicators, dashboard widget (≤30 days) |
| **DGAC help & checklist** | ✅ Done | /ayuda help center, docs/dgac/ index, persisted checklist per flight plan |
| **UI polish & navigation consistency** | ✅ Done | Spanish UI pass, shared breadcrumbs, contextual entity links, honest error states, shell/navigation consistency |

> Each block is documented in [`docs/`](docs/) with what was built, why, what was discarded, and lessons learned.

---

## Recent progress

| Area | Progress | Next move |
|---|---|---|---|
| Visual system | Light-first migration complete, design tokens normalized across all surfaces, 62 files updated | Mantener consistencia en nuevas pantallas |
| Mission flow (T-010) | Wizard podado, redirects creation→detail, progress bar con X/6 y gradiente | Etapa 2 (mapa preview en wizard) pendiente |
| Fase 4 DGAC alignment | Permissions, documents, geometry, checklist — tokens aligned, timeline localized, FlowGuide expanded to 16 routes | Próximo: Fase 5 comercialización |
| Commercial readiness | Landing page completa con casos de uso, antes/después, demo CTA | Demo data en seed script y handoff operativo |

---

## Development philosophy

### Conscious choices

| Decision | Discarded alternative | Reason |
|---|---|---|---|
| **PostGIS (planned) / SQLite (current)** over plain `lat/lng` | MongoDB | SQLite permite desarrollo local liviano sin dependencias; PostGIS se adopta en producción para consultas espaciales reales (intersección, distancia, área). El schema de Prisma está preparado para migrar de SQLite a PostgreSQL sin cambios de modelo. |
| **MapLibre** over Google Maps | Leaflet, Google Maps SDK | No API keys, no usage limits, open-source stack |
| **GeoJSON as canonical** over KML/DXF | KML as internal format | GeoJSON is the web standard; KML/DXF are interchange formats |
| **Next.js full-stack** over separate backend | Express + React SPA | No premature separation; split when scaling demands it |
| **Open-Meteo** over paid weather APIs | OpenWeatherMap (paid tier) | Completely free, no API key, good global coverage |
| **TerraDraw** over Mapbox Draw | Mapbox Draw (v1 deprecated) | Active maintenance, compatible with MapLibre, more modes |

### Learning journey

Every feature is documented with:

1. **What** was built
2. **Why** this approach was chosen
3. **What** was discarded and why
4. **Lessons learned** (technical and process)
5. **Verification** (typecheck, build, test)

This turns the repository into a **living learning record**, not just working code.

---

## Quick start

```powershell
# 1. Clone
git clone https://github.com/DovaCrii/Geo-Registros.git
cd Geo-Registros

# 2. Environment
cp .env.example .env

# 3. Dependencies & database
npm install
npx prisma generate
npx prisma migrate dev --name init

# 3b. Optional: create a development admin user
# Set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_FULL_NAME in .env
npm run seed:dev

# 4. Dev server
npm run dev
# → http://localhost:3000
```

> **Nota:** El proyecto usa SQLite por defecto para desarrollo local. No requiere Docker ni PostgreSQL.
> Si necesitás PostGIS para pruebas espaciales, levantá el contenedor con `docker compose up -d`
> y cambiá `DATABASE_URL` en `.env` a la URL de PostgreSQL (ver `.env.example`).

> Guía detallada de lanzamiento con troubleshooting en [`docs/10_launch_guide.md`](docs/10_launch_guide.md).

---

## Documentation index

### AI / execution context

For future OpenCode and Codex sessions, start with:

1. [`AGENTS.md`](AGENTS.md)
2. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
3. [`ROADMAP.md`](ROADMAP.md)
4. [`TASKS.md`](TASKS.md)
5. [`docs/OPENCODE_HANDOFF.md`](docs/OPENCODE_HANDOFF.md)

The complete documentation map is available in [`docs/00_DOCUMENTATION_INDEX.md`](docs/00_DOCUMENTATION_INDEX.md).

### What changed recently

| Area | Update | Where to review |
|---|---|---|---|
| Documentación | Docs de contexto corto para OpenCode y Codex | [`AGENTS.md`](AGENTS.md), [`PROJECT_STATUS.md`](PROJECT_STATUS.md), [`ROADMAP.md`](ROADMAP.md) |
| Sistema visual | Migración light-first completada (T-011), fix tablas seleccionables, localización ES, accesibilidad | [`CHANGELOG.md`](CHANGELOG.md), [`docs/AI_PROGRESS_LOG.md`](docs/AI_PROGRESS_LOG.md) |
| Stack real | Sincronizado README con SQLite como DB default, PostgreSQL como opcional para producción | [`README.md`](README.md), [`.env.example`](.env.example) |
| Planificación | Task tracking y handoff preparados para sesiones futuras | [`TASKS.md`](TASKS.md), [`docs/OPENCODE_HANDOFF.md`](docs/OPENCODE_HANDOFF.md) |

### GitHub review path

If you are reviewing this repository from GitHub, start here:

1. [`CHANGELOG.md`](CHANGELOG.md)
2. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
3. [`docs/00_DOCUMENTATION_INDEX.md`](docs/00_DOCUMENTATION_INDEX.md)
4. [`docs/OPENCODE_HANDOFF.md`](docs/OPENCODE_HANDOFF.md)

### Planning and design docs

| Document | Purpose |
|---|---|
| [`PROJECT_STATUS.md`](PROJECT_STATUS.md) | Master state of product, stack, risks, and current direction |
| [`ROADMAP.md`](ROADMAP.md) | Phased execution path for docs, UX, design system, workflow, and commercialization |
| [`docs/UX_WORKFLOW_MASTER_PLAN.md`](docs/UX_WORKFLOW_MASTER_PLAN.md) | Ideal operator workflow and UX priorities |
| [`docs/DESIGN_SYSTEM_PLAN.md`](docs/DESIGN_SYSTEM_PLAN.md) | Visual system plan, component priorities, and rollout strategy |
| [`docs/COMPETITOR_BENCHMARK.md`](docs/COMPETITOR_BENCHMARK.md) | Product references and principles to borrow without copying |

| Document | Content |
|---|---|---|
| [`docs/00_foundation.md`](docs/00_foundation.md) | Foundational decisions |
| [`docs/01_master_data.md`](docs/01_master_data.md) | Master data CRUD implementation |
| [`docs/02_flightplan_foundation.md`](docs/02_flightplan_foundation.md) | Flight plan base |
| [`docs/03_flightplan_progress.md`](docs/03_flightplan_progress.md) | Flight plan progress |
| [`docs/04_geometry_boundary.md`](docs/04_geometry_boundary.md) | Geometry persistence boundary |
| [`docs/05_geometry_progress.md`](docs/05_geometry_progress.md) | Geometry progress |
| [`docs/06_map_assisted_geometry.md`](docs/06_map_assisted_geometry.md) | Map-assisted geometry |
| [`docs/07_map_assisted_geometry_progress.md`](docs/07_map_assisted_geometry_progress.md) | Map-assisted geometry progress |
| [`docs/08_interactive_geometry_progress.md`](docs/08_interactive_geometry_progress.md) | Interactive map editing with TerraDraw |
| [`docs/09_kml_dxf_import_export.md`](docs/09_kml_dxf_import_export.md) | KML/DXF format interchange |
| [`docs/10_launch_guide.md`](docs/10_launch_guide.md) | Setup and troubleshooting |
| [`docs/11_permission_workflow.md`](docs/11_permission_workflow.md) | Permission workflow implementation |
| [`docs/12_ui_navigation_consistency.md`](docs/12_ui_navigation_consistency.md) | UI polish, breadcrumbs, and contextual navigation |
| [`docs/permission-workflow-guide.md`](docs/permission-workflow-guide.md) | Permission workflow operational guide |
| [`docs/dgac/00_indice_normativo.md`](docs/dgac/00_indice_normativo.md) | DGAC help index |
| [`docs/dgac/01_operaciones_rpas_chile.md`](docs/dgac/01_operaciones_rpas_chile.md) | RPAS operations in Chile |
| [`docs/dgac/02_dan_151_operaciones_rpas.md`](docs/dgac/02_dan_151_operaciones_rpas.md) | DAN 151 reference |
| [`docs/dgac/03_dan_91_operaciones_generales.md`](docs/dgac/03_dan_91_operaciones_generales.md) | DAN 91 reference |
| [`docs/dgac/04_aoc_ceo_sms_manual_operaciones.md`](docs/dgac/04_aoc_ceo_sms_manual_operaciones.md) | AOC / CEO / SMS / Manual |
| [`docs/dgac/05_checklist_permiso_vuelo.md`](docs/dgac/05_checklist_permiso_vuelo.md) | Flight-permission checklist |
| [`docs/dgac/06_documentacion_operador_dron.md`](docs/dgac/06_documentacion_operador_dron.md) | Operator / drone docs |
| [`docs/dgac/07_fiscalizacion_multas_incumplimientos.md`](docs/dgac/07_fiscalizacion_multas_incumplimientos.md) | Fiscalization and sanctions |
| [`docs/dgac/08_fuentes_oficiales_dgac.md`](docs/dgac/08_fuentes_oficiales_dgac.md) | Official sources |

---

## License

Commercial license — see [LICENSE](LICENSE).
Copyright © 2026 Cristobal Munoz. All rights reserved.

---

<p align="center"><sub>Built with TypeScript, SQLite & drone coffee · Cristobal Munoz © 2026</sub></p>
