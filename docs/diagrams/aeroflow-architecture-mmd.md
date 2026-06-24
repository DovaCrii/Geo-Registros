# AeroFlow Architecture Diagram

- Diagram type: graph
- Mermaid file: `diagrams\aeroflow-architecture-mmd.mmd`
- SVG: not generated

## Explanation

This diagram shows the high-level architecture of AeroFlow, including its frontend, backend, database, map editing tools, weather integration, PDF export capabilities, storage, and authentication/authorization components. The frontend is built with Next.js and TailwindCSS, while the backend uses Next.js server actions and Prisma ORM to interact with SQLite (for development) or PostgreSQL (for production). Map editing is facilitated by TerraDraw and Turf.js (planned), weather data is fetched from Open-Meteo API, PDF exports are handled by react-pdf/pdf-lib (planned), storage is managed locally first (with MinIO/S3 as a future option), and authentication/authorization is provided by NextAuth.js with scaffolded roles.

## Mermaid

```mermaid
graph TD
    subgraph Frontend
        F1[Next.js App]
        F2[TailwindCSS]
        F3[MapLibre GL JS]
        F4[React Components]
    end
    subgraph Backend
        B1[Next.js Server Actions]
        B2[Prisma ORM]
        B3[SQLite/PostgreSQL]
        B4[Node.js Services]
    end
    subgraph Database
        D1[SQLite (dev)]
        D2[PostgreSQL (prod, planned)]
    end
    subgraph Map Editing
        ME1[TerraDraw]
        ME2[Turf.js (planned)]
    end
    subgraph Weather Integration
        WI1[Open-Meteo API]
    end
    subgraph PDF Export
        PE1[react-pdf/pdf-lib (planned)]
    end
    subgraph Storage
        S1[Local-first (MinIO/S3 future)]
    end
    subgraph Auth & Roles
        A1[NextAuth.js]
        A2[Scaffolded roles]
    end
    F1 --> B1
    F1 --> F2
    F1 --> F3
    F1 --> F4
    B1 --> B2
    B2 --> D1
    B2 --> D2
    B1 --> ME1
    B1 --> ME2
    B1 --> WI1
    B1 --> PE1
    B1 --> S1
    B1 --> A1
    B1 --> A2
```
