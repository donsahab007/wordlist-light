## 1. Metadata dropdowns

- [x] 1.1 Replace Part of Speech and Category inputs with native selects, keeping their IDs and labels and adding an enabled empty choice.
- [x] 1.2 Define the predefined lists from the delta spec and populate choices from those lists plus exact non-empty values in the current dataset, without introducing dependencies.
- [x] 1.3 Populate options before assigning edit values; ensure Add Word resets selections to blank and existing lowercase or nonstandard values remain selectable without data normalization.

## 2. Validation

- [x] 2.1 Add focused regression checks using the existing tooling available in the repository: adding with selected or blank metadata, preserving legacy and additional dataset values, clearing selections, and resetting after editing.
- [x] 2.2 Verify saved metadata survives export/publish serialization and that opening the form does not mutate word data; confirm no bundled words.json changes.
- [x] 2.3 Check both selects in a browser for keyboard selection, Add/Edit behavior, and existing form styling; run JavaScript syntax checks, diff whitespace checks, and strict OpenSpec validation.
