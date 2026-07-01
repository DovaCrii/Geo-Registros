# Tasks — Flight Plan Geometry Editor Rework

## 1. Normalize feature metadata
- [x] Add helpers to normalize GeoJSON feature `properties` into a stable metadata shape.
- [x] Ensure created/imported features receive `id`, `name`, `entityType`, `visible`, `color`, `createdAt`, and `updatedAt`.
- [x] Preserve existing persisted geometry without introducing a schema migration.

## 2. Add explicit selection and scoped deletion
- [x] Introduce `selectedFeatureId` in the geometry editor state.
- [ ] Update map click handling so a feature becomes selected on click.
- [x] Add a `Cancel selection` action.
- [x] Replace ambiguous delete behavior with `Delete selected feature`.
- [x] Ensure delete updates the payload, measurements, and feature count immediately.

## 3. Centralize and harden payload synchronization
- [x] Make all map mutations route through a single payload sync path.
- [x] Force a final sync before submit.
- [x] Ensure import, rename, retype, recolor, visibility changes, and delete all refresh the payload.
- [ ] Add explicit save-state feedback for unsaved / saving / saved / error.

## 4. Add the element list and layer visibility controls
- [ ] Build an `Elementos del mapa` panel with all current features.
- [ ] Allow inline name editing, type changes, color changes, select, and delete from the list.
- [ ] Add operational layer toggles that hide/show features without deleting them.
- [ ] Keep hidden features persisted in GeoJSON.

## 5. Adjust the editor layout
- [ ] Give the map more space on desktop.
- [ ] Keep advanced GeoJSON controls collapsed by default.
- [ ] Ensure tool labels are explicit and action-oriented.

## 6. Verify behavior
- [ ] Create 3 features, rename them, toggle visibility, save, and reload.
- [ ] Select a feature, delete it, save, and reload.
- [ ] Import KML/KMZ/DXF and confirm metadata normalization.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
