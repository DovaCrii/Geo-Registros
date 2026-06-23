# SDD Proposal: T-022 — RBAC Consistency Audit

## Context

The repository already has a role/permission model in `src/lib/authorize.ts` and a page guard in `src/lib/require-page-auth.ts`.
The next safe step is not redesigning auth, but making sure flight plan detail actions and their UI controls are consistent with the existing model.

## Problem

- Some actions may be visible without an obvious permission check.
- Server-side enforcement and UI visibility can drift apart.
- We need a small, high-value slice that reduces accidental unauthorized access.

## Scope (IN)

- Audit flight plan detail actions and related mutation entry points.
- Align visible controls with the existing permission helpers.
- Ensure server-side mutations call explicit permission checks.
- Keep the change small and reviewable.

## Scope (OUT)

- Redesigning the permission model.
- Adding new roles or permissions.
- Refactoring unrelated workflows.

## Desired outcome

- Users only see actions they can actually perform.
- Server mutations reject unauthorized requests consistently.
- The existing auth/permission helpers remain the source of truth.
