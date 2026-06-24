# AeroFlow Architecture Diagram

- Diagram type: flowchart
- Mermaid file: `diagrams\aeroflow-architecture.mmd`
- SVG: not generated

## Explanation

This diagram illustrates the core components and their interactions within the AeroFlow platform. The frontend is built with Next.js. The backend uses Prisma to access a local SQLite database. MapLibre GL JS and TerraDraw support map editing. Auth, documents, DGAC checklist, exports, weather, and email are treated as backend-facing services.

## Mermaid

```mermaid
flowchart TD
  A[Frontend / Next.js] --> B[Backend / Prisma]
  A --> C[MapLibre GL JS]
  C --> D[TerraDraw]
  B --> E[(SQLite / local DB)]
  B --> F[Auth / NextAuth]
  F --> G[Roles]
  B --> H[Documents]
  H --> I[Uploads / Storage]
  B --> J[DGAC / Checklist]
  B --> K[Reports / Export]
  B --> L[Weather / Open-Meteo]
  B --> M[Email / Resend]
```
