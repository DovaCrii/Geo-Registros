# Tasks: Integrate no-mistakes + Biome

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

| Field | Value |
|-------|-------|
| Estimated changed lines | ~60 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |

## Phase 1: Biome Setup

- [x] 1.1 Install Biome: `npm install --save-dev @biomejs/biome` en raíz del proyecto
- [x] 1.2 Crear `biome.json` con config para TS/TSX/JSON (migrado a v2.5.1)
- [x] 1.3 Agregar scripts `lint` y `format` a `package.json`
- [x] 1.4 Ejecutar `npx @biomejs/biome check --write apps/web/src/` — 173 archivos con fixes

## Phase 2: no-mistakes Setup

- [x] 2.1 Instalar no-mistakes v1.30.1 binary via PowerShell
- [x] 2.2 Verificar instalación: `no-mistakes doctor` — todo verde
- [x] 2.3 Inicializar gate: `no-mistakes init` en el repo
- [x] 2.4 Crear `.no-mistakes.yaml` con commands: test, lint, format + auto-fix

## Phase 3: Verification

- [x] 3.1 `npm run test` — 136 tests pasaron
- [x] 3.2 `npm run build` — 41 rutas compiladas
- [x] 3.3 `npm run typecheck` — sin errores de tipos
- [x] 3.4 `no-mistakes status` — gate saludable
- [ ] 3.5 Commitear y pushear todos los cambios a GitHub
