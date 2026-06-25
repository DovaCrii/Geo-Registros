# DESIGN_SYSTEM_PLAN.md

## Purpose
Define the visual system for AeroFlow / Geo-Registros and keep implementation aligned with the current UI rollout.

## Direction
- Light mode is the primary experience.
- Dark mode is a secondary, fully supported variant.
- Prefer semantic tokens and shared components over page-specific styling.
- Avoid hardcoded dark-first classes unless they are part of an intentional fallback.

## Current Token Foundation
The system is implemented in:
- `src/app/globals.css`
- `tailwind.config.ts`

### Core tokens
- Surface: background, elevated background, panel background.
- Borders: strong and soft variants.
- Text: primary and secondary.
- Accent: accent and accent-strong.
- Status: success, warning, danger, info.

### Typography
- Base scale: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`.
- Headings use the display font.
- Body uses the sans font.
- Monospace is reserved for codes, metrics, and technical values.

### Spacing
- Grid-based spacing scale built on 4px increments.

### Radius and shadows
- Small, medium, large, and extra-large radii.
- Light shadows for surfaces; darker, softer shadows in dark mode.

## Component Patterns
- Cards: rounded, bordered surfaces with clear hierarchy.
- Inputs: high-contrast text, visible focus rings, semantic borders.
- Buttons: primary / secondary / destructive states with consistent tokens.
- Tables: readable rows, hover states, batch actions, and selection support.
- Status: badges and chips map to operational states.
- Loading/Error states: match the same visual language as content screens.

## Rollout Status
The system has already been applied gradually across:
- shared UI components
- auth screens
- admin screens
- master data screens
- dashboard and landing
- flight plan workflows
- permissions, weather, and geometry views

## Rules for New Work
1. Use shared components first.
2. Prefer token-driven classes over page-specific one-offs.
3. Keep `dark:` fallbacks for compatibility.
4. Do not change business logic for purely visual work.
5. Validate with `npm run typecheck` and `npm run build` when visual changes are non-trivial.
6. Map screens should be treated as operational workspaces: large map, compact tools, visible layers, clear save action, and technical JSON hidden behind advanced controls.

## Maintenance Note
If a screen still feels dark-first, treat it as a leftover to normalize, not as a new design pattern.
