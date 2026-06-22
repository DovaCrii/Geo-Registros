# SDD Proposal: T-030 — Operational Calendar

## Context

The product already stores an operation date for each flight plan.
Users need a simpler way to see upcoming operational load without scanning multiple lists.

## Problem

- Upcoming work is spread across screens.
- There is no calendar-like operational overview.
- Planning by date is possible in data, but not in the UI.

## Scope (IN)

- Group flight plans by `FlightPlan.operationDate`.
- Show a lightweight calendar/agenda view.
- Surface upcoming operational load in a readable way.
- Reuse existing dashboard and timeline patterns where possible.

## Scope (OUT)

- No external calendar library.
- No scheduling engine.
- No recurring-event system.
- No drag-and-drop rescheduling in the first slice.

## Desired outcome

- Users can quickly understand what is coming next.
- The view stays simple, fast, and maintainable.
- The feature adds planning value without increasing UI complexity too much.
