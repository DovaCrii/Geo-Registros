# 🗺️ Geo-Registros

**Registro operacional para planes de vuelo, geometrías y gestión documental — con ADN geoespacial desde el inicio.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3-316192?logo=postgresql)](https://postgis.net/)
[![MapLibre](https://img.shields.io/badge/MapLibre-4-7CB342?logo=maplibre)](https://maplibre.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-En%20desarrollo-blueviolet)](.)

---

## 📌 Concepto

> **Geo-Registros no es un dashboard más. Es un sistema de registro operacional donde la geometría es ciudadana de primera clase.**

La mayoría de los sistemas de gestión tratan la ubicación como un campo de texto. Geo-Registros la trata como lo que es: **un dato espacial con coordenadas, proyecciones y operaciones geométricas**.

Esto permite:

- **Dibujar** polígonos, líneas y puntos directamente sobre un mapa
- **Validar** geometrías antes de persistirlas
- **Importar/exportar** en formatos del mundo real (KML, DXF, GeoJSON)
- **Trazar** la operación completa: desde el plan de vuelo hasta el paquete documental

---

## 🧱 Entidades principales

```
┌────────────┐       ┌──────────┐       ┌──────────┐
│ CostCenter │──────▸│  Drone   │       │  Client  │
│ (centro de │       │ (dron)   │       │(cliente) │
│  costo)    │       └──────────┘       └──────────┘
└────────────┘              │                  │
       │                   │                  │
       │          ┌────────▼──────────────────▼──┐
       │          │         FlightPlan           │
       ├─────────▸│      (plan de vuelo)         │
       │          │                              │
       │          │  ┌──────────────────────┐    │
       │          │  │  geometryJson        │    │
       │          │  │  (GeoJSON canónico)  │    │
       │          │  └──────────────────────┘    │
       │          └──────────────────────────────┘
       │
┌──────▼──────┐
│  Operator   │
│ (operador)  │
└─────────────┘
```

Todas las entidades están vinculadas a través de `CostCenter`, que agrupa la estructura operativa.

---

## 🛠️ Stack técnico

| Capa | Tecnología | ¿Por qué? |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) + React 19 | SSR, server actions, routing nativo |
| **Estilos** | TailwindCSS 3 | Utilidades rápidas, sin fugas de CSS |
| **Backend** | Next.js server actions + server components | Monorepo full-stack sin desacople prematuro |
| **Base de datos** | PostgreSQL 16 + PostGIS 3 | Geometrías nativas, índice espacial, consultas geográficas |
| **ORM** | Prisma 6 | Type safety, migrations, DX superior |
| **Mapa** | MapLibre GL JS 4 | Open source, sin API keys, renderizado GL |
| **Editor geométrico** | TerraDraw vía `@watergis/maplibre-gl-terradraw` | Dibujo interactivo de puntos, líneas y polígonos |
| **Formatos** | toGeoJSON, tokml, dxf-parser/writer | Import/export sin dependencias pesadas |
| **Entorno local** | Docker Compose | PostgreSQL + PostGIS en un comando |

---

## 📊 Progreso del proyecto

| Bloque | Estado | Descripción |
|---|---|---|
| **Block 0** — Fundación | ✅ | Next.js + TS + Tailwind + Prisma + Docker |
| **Block 1** — Master Data | ✅ | CRUD de cost-centers, clients, drones, operators |
| **Block 2** — FlightPlan | ✅ | Foundation + geometry boundary + GeoJSON persistido |
| **Block 3** — Editor geométrico | ✅ | Mapa MapLibre + TerraDraw interactivo |
| **Block 4** — KML / DXF | 🚧 | Importación y exportación de formatos geoespaciales |
| **Block 5** — Mapa completo | ⏳ | Editor en vivo, mediciones, capturas |
| **Block 6** — Permisos | ⏳ | Roles y autorización por entidad |
| **Block 7** — Paquete documental | ⏳ | Documentos asociados a flight plans |

> 📖 Cada bloque tiene documentación detallada en [`docs/`](docs/), donde se explica **qué**, **por qué** y **cómo** se implementó, incluyendo decisiones técnicas, lecciones aprendidas y alternativas consideradas.

---

## 🎯 Filosofía de desarrollo

### Decisiones conscientes

No seguimos modas. Cada tecnología fue elegida por su **justificación técnica**:

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| **PostGIS** en lugar de campo `lat/lng` | MongoDB, SQLite | Necesitamos consultas espaciales reales (intersección, distancia, área) |
| **MapLibre** en lugar de Google Maps | Leaflet, Google Maps SDK | Sin API keys, sin límites de uso, stack open source |
| **GeoJSON como interno** en lugar de KML/DXF | KML interno | GeoJSON es el estándar web, los otros son formatos de intercambio |
| **Next.js full-stack** en lugar de backend separado | Express + React SPA | Evitamos desacople prematuro; si escala, se separa |

### Registro de aprendizaje

Cada avance se documenta con:

1. **Qué** se construyó
2. **Por qué** se hizo así
3. **Qué se descartó** y por qué
4. **Lecciones aprendidas** (técnicas y de proceso)
5. **Verificación** (typecheck, build, pruebas)

Este enfoque convierte el repositorio en un **registro de aprendizaje vivo**, no solo en código funcionando.

---

## 🚀 Inicio rápido

```powershell
# 1. Clonar
git clone https://github.com/DovaCrii/Geo-Registros.git
cd Geo-Registros

# 2. Variables de entorno
cp .env.example .env

# 3. Base de datos (requiere Docker Desktop)
docker compose up -d

# 4. Dependencias y migraciones
npm install
npx prisma generate
npx prisma migrate dev --name init

# 5. Dev
npm run dev
# → http://localhost:3000
```

> 📋 Guía detallada en [`docs/10_launch_guide.md`](docs/10_launch_guide.md) con troubleshooting.

---

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [`docs/00_foundation.md`](docs/00_foundation.md) | Decisiones fundacionales del proyecto |
| [`docs/01_master_data.md`](docs/01_master_data.md) | Implementación de datos maestros |
| [`docs/02_flightplan_foundation.md`](docs/02_flightplan_foundation.md) | Base del plan de vuelo |
| [`docs/04_geometry_boundary.md`](docs/04_geometry_boundary.md) | Frontera de geometría y persistencia GeoJSON |
| [`docs/08_interactive_geometry_progress.md`](docs/08_interactive_geometry_progress.md) | Editor interactivo con TerraDraw |
| [`docs/09_kml_dxf_import_export.md`](docs/09_kml_dxf_import_export.md) | Importación/exportación de formatos |
| [`docs/10_launch_guide.md`](docs/10_launch_guide.md) | Guía de puesta en marcha |

---

## 📄 Licencia

MIT — ver [LICENSE](LICENSE) para más detalles.

---

<p align="center"><sub>Hecho con 🌎 y TypeScript · DovaCrii © 2026</sub></p>
