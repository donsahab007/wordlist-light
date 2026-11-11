## Context

See proposal.md for motivation. The form currently reads and writes metadata
through input `.value` properties. A native select can retain that interface.
The dataset includes lowercase variants ("noun", "politics"), additional
categories ("character", "feeling"), and a word with empty metadata. Switching
to fixed options alone could silently clear those values on edit.

## Goals / Non-Goals

**Goals:**
- Keep the existing form submission and word-data schema compatible.
- Define choice membership and legacy handling before implementation.
- Use native keyboard-accessible controls without new dependencies.

**Non-Goals:**
- Correcting or bulk-normalizing existing metadata.
- Introducing free-text alternatives, category management, or multiple selections.
- Changing search, publishing, authentication, or the recent dialog work.

## Decisions

### Native selects retain the existing control IDs

Replace the two inputs with selects using `fPartOfSpeech` and `fCategory`.
Include an enabled empty option first so reset and clearing remain possible.
Existing labels continue to identify the controls, and the current select
styling used for Difficulty can be reused. A custom widget or datalist would
add complexity or permit the free text the user explicitly excluded.

### Predefined choices plus exact existing dataset values

Define the nine parts of speech and twelve categories specified in the delta
spec as small local lists. Category is a thematic classification rather than
a universal grammatical taxonomy; use the existing themes, adding title-case
Character and Feeling corresponding to themes already in the dataset.

Before assigning values when opening the form, populate each dropdown from
the union of its predefined list and non-empty values in the current in-memory
dataset. Deduplicate exact values and order consistently with the empty choice
first. Build options with DOM text/value properties, not interpolated HTML.

Case-distinct legacy values remain distinct options. This is intentionally
non-destructive: case-insensitive normalization would change existing data,
and fixed lists without dataset values would make old entries unselectable.
Repopulating on opening keeps choices aligned with data after local edits.

### Preserve the existing save/export/publish path

Keep the `.value`-based submission logic and serialized string fields.
When editing, populate options before assigning the existing metadata. When
adding, reset both to the empty option. Merely opening the form must not write
to the dataset. No modification of the bundled words.json is needed.

## Risks / Trade-offs

- [Case-distinct options look similar] -> Preserve them to avoid implicit data
  migration; bulk cleanup is outside this change.
- [New categories cannot be typed into the form] -> Intentional user decision;
  extend predefined choices in a future change if needed.
- [Select conversion could clear legacy or optional fields] -> Validate actual
  form add/edit/reset behavior, including legacy, blank, and additional values.

## Migration Plan

Deploy static HTML/JS changes through the normal GitHub Pages workflow after
approval. No data migration is required. Rollback restores the two text inputs
and their previous form initialization; the data schema remains unchanged.
