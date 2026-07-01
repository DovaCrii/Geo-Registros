# Proposal: Rebuild the flight-plan geometry editor flow

## Problem
The current geometry editor is functionally fragile. It relies on Terra Draw as the live map state but treats the persisted payload as a full replacement snapshot, which makes selection, delete, import, and save flows hard to reason about.

The result is an ambiguous editor where users cannot reliably:
- identify a selected feature,
- list and manage all map elements,
- hide/show layers without losing data,
- rename or reclassify elements,
- trust that the saved payload matches what they just edited.

## Goal
Make the editor functional-first and predictable while keeping all metadata inside `geometryJson` / GeoJSON properties.

## Proposed behavior
The editor SHOULD:
- keep a stable `selectedFeatureId`,
- persist element metadata in GeoJSON properties only,
- expose a visible list of map elements,
- allow visibility toggles per layer/type,
- make delete explicit and scoped to the selected feature,
- force a final payload sync before save,
- show clear save state feedback,
- preserve imported geometries without a schema migration.

## Boundaries
The first slice MUST focus on behavior and state model, not visual redesign.

### Included
- feature identity and metadata normalization,
- explicit selection state,
- delete selected only,
- list of map elements,
- reliable sync path into `geometryPayload`,
- save-state feedback.

### Excluded for the first slice
- database migration,
- new tables,
- advanced styling refresh,
- cross-page map architecture changes,
- undo/redo system rewrite.

## Rollback plan
Because the payload remains GeoJSON-compatible, the slice SHOULD be reversible by removing the new selection/list UI and falling back to the current Terra Draw snapshot flow.

## Risks
- keeping Terra Draw state and React state in sync,
- preserving metadata during import/export,
- avoiding accidental payload overwrites,
- ensuring hidden layers remain saved.

## Recommendation
Start with a **state/persistence hardening slice**:
1. normalize feature metadata,
2. add selected feature state,
3. centralize sync,
4. wire delete/save correctness,
5. then add the list/capabilities panel.
