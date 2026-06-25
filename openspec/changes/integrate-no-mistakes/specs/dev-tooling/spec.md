# Dev Tooling Specification — no-mistakes + Biome

## Purpose

Integrate no-mistakes (AI-driven Git proxy) and Biome (lint/format) into the AeroFlow project to establish automated code quality gates before every push.

## Requirements

### Requirement: Biome Installation

The system MUST install Biome as a dev dependency before any lint/format commands are used.

#### Scenario: Install Biome

- GIVEN the project root directory
- WHEN `npm install --save-dev biome` is executed
- THEN Biome SHALL be listed in `devDependencies` in `package.json`
- AND `npx biome --version` SHALL return a version number

#### Scenario: Verify existing commands still work

- GIVEN Biome is installed
- WHEN `npm run test` and `npm run build` are executed
- THEN both SHALL pass without errors

### Requirement: Biome Configuration

The system MUST create a `biome.json` configuration file at the project root.

#### Scenario: Create biome.json

- GIVEN the project root directory
- WHEN `biome.json` does not exist
- THEN a `biome.json` file SHALL be created with:
  - `$schema` pointing to the Biome schema
  - `linter.enabled: true`
  - `linter.rules.recommended: true`
  - `formatter.enabled: true`
  - `formatter.formatWithErrors: true`
  - `javascript.formatter.semicolons: "always"`
  - `javascript.formatter.trailingCommas: "all"`
  - `vcs.enabled: true`
  - `vcs.clientKind: "git"`
  - `vcs.useIgnoreFile: true`
  - `files.ignoreUnknown: true`

#### Scenario: Detect source files

- GIVEN Biome is configured
- WHEN `npx biome check apps/web/src/ backend/` is executed
- THEN it SHALL analyze all TypeScript/TSX/JSON files without crashing

### Requirement: Package Scripts

The system MUST add `lint` and `format` scripts to the root `package.json`.

#### Scenario: Add lint script

- GIVEN `package.json` exists
- WHEN the `lint` script is added
- THEN `"lint": "npx biome check apps/web/src/ backend/"` SHALL be present in `scripts`

#### Scenario: Add format script

- GIVEN `package.json` exists
- WHEN the `format` script is added
- THEN `"format": "npx biome format --write apps/web/src/ backend/"` SHALL be present in `scripts`

### Requirement: no-mistakes Installation

The system MUST install the no-mistakes binary on the development machine.

#### Scenario: Install binary

- GIVEN a Windows development machine with PowerShell
- WHEN the no-mistakes install script is executed
- THEN the `no-mistakes` binary SHALL be available in PATH
- AND `no-mistakes --version` SHALL return a version number

#### Scenario: Verify daemon

- GIVEN no-mistakes is installed
- WHEN `no-mistakes doctor` is executed
- THEN it SHALL report a healthy system with no critical issues

### Requirement: no-mistakes Gate Initialization

The system MUST initialize a no-mistakes gate for the repository.

#### Scenario: Init gate

- GIVEN the repository at C:\Users\cmunoz\Geo-Registros
- WHEN `no-mistakes init` is executed
- THEN a gate repository SHALL be created at `~/.no-mistakes/repos/<id>.git`
- AND a `no-mistakes` git remote SHALL be added to the repo
- AND a `post-receive` hook SHALL be installed

#### Scenario: Idempotent re-init

- GIVEN the gate already exists
- WHEN `no-mistakes init` is executed again
- THEN the command SHALL succeed without errors
- AND the existing gate SHALL be refreshed

### Requirement: no-mistakes Configuration

The system MUST create a `.no-mistakes.yaml` file at the repository root with project-specific commands.

#### Scenario: Create config

- GIVEN the repository root
- WHEN `.no-mistakes.yaml` does not exist
- THEN it SHALL be created with:
  - `agent: opencode`
  - `commands.test: "npm run test"`
  - `commands.lint: "npx biome check apps/web/src/ backend/"`
  - `commands.format: "npx biome format --write apps/web/src/ backend/"`
  - `auto_fix.lint: 3`
  - Test evidence stored in repo: `true`

#### Scenario: Pipeline runs on push

- GIVEN the gate is initialized and configured
- WHEN `git push no-mistakes <branch>` is executed
- THEN the pipeline SHALL execute: intent → rebase → review → test → lint → push
- AND the branch SHALL only reach the remote if all stages pass

### Requirement: Post-Integration Verification

The system MUST verify the complete integration works end-to-end.

#### Scenario: Full verification

- GIVEN all installation and configuration steps are complete
- WHEN `no-mistakes status` is executed
- THEN it SHALL show the repo is connected to a healthy gate
- AND `no-mistakes runs` SHALL show available run history

## Coverage

| Area | Happy Path | Edge Cases | Error States |
|------|-----------|------------|--------------|
| Biome installation | ✅ | ✅ | — |
| Biome config | ✅ | — | — |
| Package scripts | ✅ | — | — |
| no-mistakes install | ✅ | ✅ | — |
| Gate init | ✅ | ✅ | — |
| Pipeline config | ✅ | — | — |
| Verification | ✅ | — | — |

## Next Step

Ready for design (sdd-design).
