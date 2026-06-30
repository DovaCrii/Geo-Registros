# AeroFlow

**Plataforma para operaciones RPA/drones, trazabilidad geoespacial y gestión documental.**

AeroFlow centraliza planificación de misiones, geometría, permisos DGAC/SIGO, documentos y reportes en un flujo claro y auditable.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite)](https://www.sqlite.org/)
[![MapLibre](https://img.shields.io/badge/MapLibre-4-7CB342?logo=maplibre)](https://maplibre.org/)

---

## Qué resuelve

Hoy, una operación con drones suele quedar repartida entre planillas, correos, PDFs y archivos geográficos. AeroFlow ordena ese trabajo en una sola experiencia:

- misión
- mapa
- documentos
- permisos
- trazabilidad
- reportes

---

## Flujo operativo

```mermaid
flowchart LR
  A[Dashboard] --> B[Crear misión]
  B --> C[Definir geometría]
  C --> D[Adjuntar documentos]
  D --> E[Revisar permiso]
  E --> F[Operar y cerrar]
  F --> G[Auditar y reportar]
```

---

## Esquema del producto

```mermaid
erDiagram
  COST_CENTER ||--o{ FLIGHT_PLAN : groups
  CLIENT ||--o{ FLIGHT_PLAN : requests
  DRONE ||--o{ FLIGHT_PLAN : assigned
  OPERATOR ||--o{ FLIGHT_PLAN : pilots
  FLIGHT_PLAN ||--o{ DOCUMENT : contains
  FLIGHT_PLAN ||--o{ PERMISSION_EVENT : audits
  FLIGHT_PLAN ||--|| GEOMETRY : defines
```

---

## Capacidades clave

| Área | Valor |
|---|---|
| Dashboard | Visión operativa de lo urgente |
| Planes de vuelo | Creación y seguimiento de misiones |
| Mapa | Geometría interactiva y visual |
| Permisos | Estados, checklist y trazabilidad |
| Documentos | Evidencia y respaldo por misión |
| Reportes | Exportación y entrega técnica |

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| UI | Tailwind CSS 3 |
| Backend | Next.js server actions y route handlers |
| Datos | Prisma 6, SQLite en desarrollo |
| Mapas | MapLibre + TerraDraw |
| Tests | Vitest |

---

## Inicio simple

```powershell
git clone https://github.com/DovaCrii/Geo-Registros.git
cd Geo-Registros
npm install
npm run dev
```

Abrí la app en `http://localhost:3000`.

---

## Documentación esencial

- `AGENTS.md` — contrato operativo
- `DECISIONS.md` — decisiones estables
- `KNOWN_BUGS.md` — riesgos abiertos

---

## Licencia

Licencia comercial. Ver [`LICENSE`](LICENSE).

Copyright © 2026 Cristobal Munoz.
