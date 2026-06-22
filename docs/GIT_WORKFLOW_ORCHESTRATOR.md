# Git Workflow Orchestrator — AeroFlow

## Idea central
Usar Git + handoffs generados como memoria operativa ligera.

## Branches
- `main` — estable
- `feat/T-XXX` — una tarea concreta
- `ux/` — mejora transversal
- `codex/` — revisión / documentación / QA

## Secuencia mínima
1. `node scripts/vibe-check.js`
2. Implementar en la branch de trabajo
3. `npm run build && npm run typecheck`
4. `node scripts/vibe-review.js`
5. `git push`
6. `node scripts/git-handoff.js`

## Convención de commit
Usar GCP:
- `[What]`
- `[Why]`
- `[How]`
- `[Next]`
- `[Validate]`
- `[Files]`
- `[Agent]`

## Handoff
- `docs/HANDOFF/VIBE_CHECK.md`
- `docs/HANDOFF/VIBE_REVIEW.md`
- `docs/HANDOFF/GIT_HANDOFF.md`

## Regla práctica
Si el script no existe, no fingir automatización: documentarlo o implementarlo.
