# Delta Spec — Flight Plan Geometry Editor Rework

## ADDED Requirements

### Requirement: Persist feature metadata inside GeoJSON properties
The geometry editor MUST store all element metadata inside `geometryJson` / GeoJSON `properties` and MUST NOT require a database migration for this change.

#### Scenario: New features are created with normalized metadata
- **Given** a user creates a new feature in the editor
- **When** the feature is added to the map state
- **Then** the feature MUST include persisted metadata in `properties` for `id`, `name`, `entityType`, `visible`, `color`, `createdAt`, and `updatedAt`
- **And** the feature name MUST be auto-generated using the configured naming pattern for its type
- **And** the persisted payload MUST remain valid GeoJSON

#### Scenario: Imported features are normalized before save
- **Given** a user imports KML, KMZ, DXF, or GeoJSON content
- **When** the editor converts the imported data into map features
- **Then** the imported features MUST be normalized into the same persisted metadata shape
- **And** imported items MUST receive a stable `id` if one is missing
- **And** imported items MUST be assigned a default `entityType`

### Requirement: Explicit selection state MUST exist
The editor MUST track the currently selected feature with an explicit `selectedFeatureId` state.

#### Scenario: Clicking a feature selects it
- **Given** the map contains at least one feature
- **When** the user clicks a feature on the map
- **Then** that feature MUST become the selected feature
- **And** the UI MUST show the selected feature's name, type, color, and available actions

#### Scenario: Cancelling selection clears the active feature
- **Given** a feature is selected
- **When** the user clicks Cancel selection
- **Then** `selectedFeatureId` MUST be cleared
- **And** feature-specific actions MUST become unavailable

### Requirement: Delete MUST affect only the selected feature
The editor MUST provide an explicit delete action that removes only the currently selected feature.

#### Scenario: Delete is disabled without a selection
- **Given** no feature is selected
- **When** the editor renders the delete action
- **Then** the delete action MUST be disabled

#### Scenario: Deleting a selected feature updates the payload immediately
- **Given** a feature is selected
- **When** the user deletes the selected feature
- **Then** only that feature MUST be removed from the map state
- **And** the geometry payload MUST be synchronized immediately
- **And** measurements and feature counts MUST refresh

### Requirement: Element list MUST expose per-feature operations
The editor MUST display a panel of map elements listing every feature.

#### Scenario: The element list shows all current features
- **Given** the map contains multiple features
- **When** the editor renders the element list
- **Then** each feature MUST appear with its name, type, color, visibility state, and controls

#### Scenario: Renaming or retyping a feature persists
- **Given** a feature is listed in the element panel
- **When** the user changes its name, type, or color
- **Then** the change MUST be reflected in the in-memory map state
- **And** the geometry payload MUST be synchronized
- **And** the updated value MUST survive page reload after save

### Requirement: Layer visibility controls MUST hide without deleting
The editor MUST provide operational layer toggles that hide or show features by type without deleting persisted geometry.

#### Scenario: Turning off a layer hides matching features
- **Given** at least one feature belongs to a layer type that can be toggled off
- **When** the user disables that layer
- **Then** matching features MUST stop rendering visually
- **And** the underlying GeoJSON MUST remain intact

#### Scenario: Turning the layer back on restores visibility
- **Given** a layer type is hidden
- **When** the user re-enables that layer
- **Then** the previously hidden features MUST render again from the same persisted payload

### Requirement: Sync MUST be centralized and forced before save
The editor MUST centralize payload synchronization through a single sync function and MUST force a final sync before submitting the form.

#### Scenario: Every map mutation updates the payload
- **Given** the user creates, edits, renames, retypes, recolors, hides, shows, deletes, or imports a feature
- **When** the mutation completes
- **Then** the editor MUST synchronize the payload through the same sync path

#### Scenario: Save submits the latest geometry
- **Given** the editor contains unsaved changes
- **When** the user saves the flight plan geometry
- **Then** the editor MUST perform a final synchronization before submit
- **And** the saved record MUST match the current visible state after reload

### Requirement: Save state MUST be explicit
The editor MUST show clear save status feedback.

#### Scenario: Unsaved changes are visible
- **Given** the editor state differs from the last saved payload
- **When** the user views the editor
- **Then** the UI MUST indicate that there are unsaved changes

#### Scenario: Save success and failure are distinguishable
- **Given** the user saves the editor
- **When** the operation succeeds
- **Then** the UI MUST indicate that the changes were saved correctly
- **When** the operation fails
- **Then** the UI MUST indicate an error state

### Requirement: The editor layout MUST prioritize map workspace
The geometry editor layout SHOULD give more space to the map workspace than to the sidebar tools.

#### Scenario: Desktop layout favors the map
- **Given** the editor is displayed on desktop
- **When** the page renders
- **Then** the map workspace SHOULD occupy approximately 70–75% of the horizontal space
- **And** advanced JSON controls SHOULD be collapsed by default

## MODIFIED Requirements

### Requirement: Geometry persistence uses the existing flight plan record
The current flight plan geometry persistence MUST continue using the existing `geometryJson` field and MUST NOT add a new table for the first slice.

#### Scenario: Existing flight plan save flow remains compatible
- **Given** an existing flight plan record
- **When** the user updates geometry and saves
- **Then** the record MUST continue to persist through the current flight plan update action
- **And** existing consumers of `geometryJson` MUST remain compatible
