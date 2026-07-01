# Design — Flight Plan Geometry Editor Rework

## Goal
Refactor the geometry editor so selection, per-feature metadata, visibility, deletion, and save synchronization are explicit and reliable while keeping persistence inside the existing `geometryJson` field.

## Architecture decisions

### 1. Keep one persisted payload
The editor MUST continue persisting the flight plan geometry through the existing `geometryJson` / `geometryPayload` path.

Rationale:
- avoids a schema migration,
- preserves compatibility with current readers,
- keeps the first slice reversible.

### 2. Introduce normalized feature metadata
Every persisted feature SHOULD be normalized to a stable shape in `properties`:

- `id`
- `name`
- `entityType`
- `visible`
- `color`
- `createdAt`
- `updatedAt`

The editor SHOULD infer defaults for missing fields during import or creation.

### 3. Use explicit React selection state
Add `selectedFeatureId` to the editor state.

Selection flow:
- clicking a feature sets `selectedFeatureId`,
- `Cancel selection` clears it,
- delete/rename/type/color actions operate on the selected feature.

### 4. Centralize sync through a single payload writer
All map mutations SHOULD converge on a single `syncPayloadFromMap` path.

Required sync triggers:
- create,
- edit,
- rename,
- type change,
- color change,
- visibility toggle,
- delete,
- import,
- before submit.

### 5. Treat layer visibility as render state only
Layer toggles MUST hide features visually but MUST NOT remove persisted features.

## Recommended implementation slice
Implement in this order:
1. metadata normalization helpers,
2. selection state,
3. delete selected action,
4. sync hardening,
5. element list panel,
6. layer visibility toggles,
7. save-state feedback.

## Flow sketch

```text
User action
  -> editor state update
  -> normalize feature metadata if needed
  -> syncPayloadFromMap
  -> setPayload(JSON.stringify(...))
  -> hidden input updates
  -> submit/update action persists geometryJson
```

## Risks
- Terra Draw may emit events that cause duplicate syncs.
- Import data may arrive without stable IDs or metadata.
- Visibility toggles can accidentally become destructive if they filter the payload instead of render output.
- Selected feature references can become stale after delete/import unless cleaned up.

## Rollback
If the slice misbehaves, rollback by removing the selection/list UI and returning to the previous Terra Draw snapshot flow. The schema stays unchanged.
