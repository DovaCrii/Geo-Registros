# AeroFlow

**Platform for drone/RPA flight operations, geo-registration, technical deliverables, and operational compliance — from mission planning to report delivery in a single traceable workflow.**

> 🇪🇸 **AeroFlow** convierte vuelos con drones en operaciones listas para auditar: mapa, permisos DGAC/SIGO, trazabilidad y reportes en una sola plataforma.

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
| Production-ready platform with DGAC workflow complete, 138 tests, Centro de Conocimiento, and premium landing | Final UX polish: reviewer mode, document preview, dashboard semáforo | `ux-dgac-login-fix` |

### Current highlights

- **Centro de Conocimiento** (/ayuda): buscador en vivo, flujo operacional de 7 etapas, preview inline de documentos, secciones normativas.
- **Fase DGAC completa**: permisos, documentos, geometría, checklist, HelpDocs Prisma, 138 tests.
- **Modo revisor**: comparación read-only y notas locales para revisión de permisos.
- **Paquete documental**: preflight visual y PDF de vista previa antes de enviar.
- **Dashboard semáforo**: readiness claro con señales verde/amarillo/rojo.
- **Modo campo**: toggle persistente para tablets/terreno con controles más grandes.
- **Landing premium**: hero con CTA gradiente, proof points concretos, stats con datos reales de la plataforma.
- **Seed demo** (`SEED_DEMO=true`): demo user auto-creado, 4 planes de vuelo (DRAFT/IN_REVIEW/AUTHORIZED/CLOSED), 17 eventos, 5 HelpDocs, 3 notificaciones.
- **Sistema visual aplicado**: light-first, dark mode secondary, tokens `slate-950` normalizados.
- **Flujo de misión rediseñado**: wizard de 4 pasos, redirects creation→detail con barra de progreso.
- **Mapa operacional consolidado**: editor geometría con alertas geográficas y workspace visual ya operativo.

### Review this first

1. [`CHANGELOG.md`](CHANGELOG.md)
2. [`PROJECT_STATUS.md`](PROJECT_STATUS.md)
3. [`ROADMAP.md`](ROADMAP.md)
4. [`TASKS.md`](TASKS.md)
5. [`docs/OPENCODE_HANDOFF.md`](docs/OPENCODE_HANDOFF.md)

---

## Concept

> **AeroFlow centraliza operaciones RPA/drone en una plataforma profesional — desde la planificación de la misión y el mapeo interactivo hasta la gestión documental, los flujos de permiso DGAC/SIGO y la trazabilidad operativa completa.**

Hoy, gestionar permisos de drones, registros de vuelo, documentos de aeronaves, credenciales de operadores y geometría de misión significa lidiar con correos, planillas, PDFs, archivos KML y carpetas compartidas. AeroFlow reemplaza esa fragmentación con una plataforma estructurada, visual y trazable.

**Lo que hace diferente a AeroFlow:**

- **Workflow de permisos DGAC/SIGO** — Máquina de estados completa (borrador → revisión → enviado → autorizado → rechazado → cerrado)
- **Mapa como herramienta, no decoración** — Dibujá zonas, medí áreas, marcá zonas restringidas, guardá GeoJSON desde el navegador
- **Planificación con datos meteorológicos** — Viento, temperatura y precipitación vía Open-Meteo (API gratuita, sin API key)
- **Guía de proceso integrada** — FlowGuide te dice qué falta, qué sigue y cómo completar cada paso
- **Documentos por misión** — Cada plan de vuelo lleva su paquete documental: permisos, seguros, checklists, bitácoras, archivos KMZ
- **Traza de auditoría** — Cada cambio de estado, carga de documento y comunicación queda registrado con quién, cuándo y por qué
- **Demo lista para probar** — `SEED_DEMO=true` crea datos de ejemplo: 4 planes, 17 eventos, 5 HelpDocs, 3 notificaciones

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
| Fase 4 DGAC | Completa: permisos, documentos, geometría, checklist, HelpDocs Prisma, FlowGuide 16 rutas, 136 tests | ✅ Cerrada |
| Fase 5 Comercial | Landing premium (hero gradiente, stats, proof points); Seed demo con SEED_DEMO=true; README actualizado | ✅ Fase completa |
| Fase 6 Centro Conocimiento | Buscador en vivo, flujo 7 etapas, preview inline, secciones normativas | ✅ Implementado |
| Geometry workflow | GeoJSON sale del flujo normal; editor pasa a workspace con capas (planificado) | Fase 7 — Mapa operacional |

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

### Demo data

Para probar la plataforma con datos de ejemplo:

```powershell
# Configura en .env:
SEED_DEMO=true

# Ejecutá el seed (sin env vars extras — usa credenciales por defecto):
npm run seed:dev
```

Esto crea automáticamente:
- **1 admin**: `demo@aeroflow.io` / `demo1234` (no requiere env vars)
- **3 equipos de trabajo** (Minería Norte, Construcción Santiago Sur, Topografía y Fotogrametría)
- **3 clientes** (Minera Los Pelambres, Constructora Vial SA, Municipalidad de Providencia)
- **3 drones** (Matrice 350 RTK, Mavic 3 Enterprise, EVO II Pro V3)
- **3 operadores** con licencias vigentes
- **4 planes de vuelo**: DRAFT (levantamiento norte), IN_REVIEW (puente), AUTHORIZED (humedal), CLOSED (fotogrametría completa)
- **17 eventos** de línea de tiempo de permisos — incluyendo el flujo completo hasta CLOSED
- **5 documentos** asociados (seguro, checklist, resolución DGAC, KMZ, plano)
- **5 HelpDocs** en el Centro de Conocimiento
- **3 notificaciones** (2 sin leer) para probar el panel

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
