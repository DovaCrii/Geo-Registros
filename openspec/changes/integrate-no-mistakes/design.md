# Design: Integrate no-mistakes + Biome

## Technical Approach

Two-phase integration: (1) install and configure Biome for lint/format, (2) install and configure no-mistakes as the Git proxy gate. Biome MUST be ready before no-mistakes init because no-mistakes reads the repo config and validates the lint command exists.

## Architecture Decisions

### Decision: Biome over ESLint + Prettier

**Choice**: Biome (single tool for lint + format)
**Alternatives**: ESLint + Prettier (two tools, more config), StandardJS (less flexible)
**Rationale**: Biome is faster, has zero config out of the box, handles both lint and format with a single binary, and works natively with TypeScript/TSX. No plugin ecosystem to maintain.

### Decision: no-mistakes auto-fix with limit 3

**Choice**: `auto_fix.lint: 3`
**Alternatives**: No auto-fix (manual only), unlimited auto-fix
**Rationale**: Auto-fix handles mechanical issues (formatting, unused imports) without user friction. Limit of 3 prevents the tool from making sweeping changes without review.

### Decision: npm install over global install for Biome

**Choice**: Local dev dependency via `npm install --save-dev biome`
**Alternatives**: Global install via `npm install -g biome`, binary download
**Rationale**: Local dependency ensures all team members use the same version. Locked in `package-lock.json`. Standard practice for Node.js projects.

### Decision: no-mistakes gate at user-level (default)

**Choice**: Default gate location at `~/.no-mistakes/repos/`
**Alternatives**: Custom gate path via `NM_HOME`
**Rationale**: Default is simpler, follows no-mistakes convention. No reason to customize for a single-project setup.

## Execution Plan

### Phase 1: Install and Configure Biome

**Step 1.1**: Install Biome as dev dependency
```powershell
cd C:\Users\cmunoz\Geo-Registros
npm install --save-dev biome
```

**Step 1.2**: Create `biome.json`
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "ignore": ["node_modules", ".next", "storage"]
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "semicolons": "always",
      "trailingCommas": "all",
      "quoteStyle": "double"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

**Step 1.3**: Add scripts to root `package.json`
```json
{
  "scripts": {
    // ... existing scripts ...
    "lint": "npx biome check apps/web/src/ backend/",
    "format": "npx biome format --write apps/web/src/ backend/"
  }
}
```

**Step 1.4**: Verify Biome
```powershell
npx biome check apps/web/src/backend/prisma/schema.prisma
```

### Phase 2: Install and Configure no-mistakes

**Step 2.1**: Install no-mistakes binary
```powershell
irm https://raw.githubusercontent.com/kunchenguid/no-mistakes/main/docs/install.ps1 | iex
```

**Step 2.2**: Verify installation
```powershell
no-mistakes doctor
```

**Step 2.3**: Initialize gate
```powershell
cd C:\Users\cmunoz\Geo-Registros
no-mistakes init
```

**Step 2.4**: Create `.no-mistakes.yaml`
```yaml
agent: opencode
commands:
  test: "npm run test"
  lint: "npx biome check apps/web/src/ backend/"
  format: "npx biome format --write apps/web/src/ backend/"
auto_fix:
  lint: 3
test:
  evidence:
    store_in_repo: true
ignore_patterns:
  - ".next/**"
  - "node_modules/**"
  - "storage/**"
  - "*.generated.*"
```

**Step 2.5**: Verify pipeline
```powershell
no-mistakes status
no-mistakes runs
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `biome.json` | Create | Biome configuration (lint + format rules) |
| `.no-mistakes.yaml` | Create | no-mistakes pipeline config for the repo |
| `package.json` | Modify | Add `lint` and `format` scripts |

## Verification

| Step | Command | Expected Result |
|------|---------|----------------|
| Biome installed | `npx biome --version` | Version number |
| Biome lint works | `npx biome check apps/web/src/` | Reports no errors or lists issues |
| Biome format works | `npx biome format --write apps/web/src/` | Formats files in place |
| no-mistakes installed | `no-mistakes --version` | Version number |
| no-mistakes healthy | `no-mistakes doctor` | All checks green |
| Gate initialized | `no-mistakes status` | Shows connected gate |
| Tests still pass | `npm run test` | 136 tests passed |
| Build still works | `npm run build` | 41 routes compiled |
| Typecheck passes | `npm run typecheck` | No type errors |

## Rollback

If any verification step fails:
1. For Biome issues: `npm uninstall biome && rm biome.json && git checkout package.json`
2. For no-mistakes issues: `cd Geo-Registros && no-mistakes eject` to remove the gate
3. For both: execute rollback in reverse order (no-mistakes first, then Biome)

## Open Questions

- None — all decisions made with the user.
