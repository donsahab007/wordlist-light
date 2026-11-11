## Why

Free-text Part of Speech and Category fields make adding words slower and allow
inconsistent metadata. Dropdowns will make common choices easy to select while
preserving all existing vocabulary data.

## What Changes

- Replace both text inputs in the Add/Edit Word form with native dropdowns.
- Predefine standard English parts of speech and the categories already used by
  the application; include existing dataset values to avoid losing legacy values.
- Keep both fields optional with an empty choice.
- Restrict entry to listed options; do not add an Other/free-text path.
- Preserve existing values when editing and keep export/publish data compatible.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `word-editing`: Define dropdown choices for part of speech and category,
  including blank selection and preservation of existing values.

## Impact

- `index.html`: Add/Edit Word controls.
- `app.js`: Option lists, population, and edit-form initialization.
- Focused validation of adding, editing, and serializing word metadata.
- No dependencies, backend, schema migration, or bulk changes to `words.json`.
