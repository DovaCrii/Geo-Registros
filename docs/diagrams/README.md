# Diagram AI

Local text-to-diagram helper for AeroFlow.

## What it does

- Sends a technical prompt to the local Ollama server.
- Requests structured JSON with Mermaid output.
- Saves the Mermaid source under `diagrams/`.
- Saves human-readable documentation under `docs/diagrams/`.
- Tries to render an SVG when `@mermaid-js/mermaid-cli` is available.

## Model

- Default: `qwen2.5-coder:7b`
- Override with `DIAGRAM_MODEL`

## Output locations

- Mermaid: `diagrams/<fileName>.mmd`
- SVG: `diagrams/<fileName>.svg`
- Docs: `docs/diagrams/<fileName>.md`

## Ready-to-paste files

- `diagrams/aeroflow-architecture-ready.mmd`
- `diagrams/aeroflow-operational-flow-ready.mmd`
- `diagrams/aeroflow-domain-model-ready.mmd`
- `diagrams/aeroflow-ux-map-first-ready.mmd`

## Usage

```bash
pnpm diagram:ai "Generate an architecture diagram for AeroFlow"
```

## Example

```bash
pnpm diagram:ai "Genera un diagrama de arquitectura general de AeroFlow con frontend, mapa, backend, Prisma, base de datos, permisos DGAC/SIGO, checklist y exportaciones."
```

## Reuse in GitHub

- Commit the `.mmd` file when you want a diff-friendly source of truth.
- Render the Mermaid block in Markdown code fences for reviews.
- Keep SVGs for quick visual reference.

## SVG note

- SVG export depends on Mermaid CLI being able to launch Chrome.
- If SVG is skipped, the Mermaid source is still saved and can be rendered later.
