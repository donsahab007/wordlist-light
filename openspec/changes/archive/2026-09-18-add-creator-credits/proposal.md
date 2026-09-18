## Why

This project is a father-son effort: Roopesh built it, and his 10-year-old
son Bhavya Suryavanshi is a joint developer. The site currently has no
attribution at all. Adding a small, fun "About" credit makes the shared
ownership visible and gives Bhavya something concrete and proud to point
to, without adding any weight, backend, or clutter to the lightweight SPA.

## What Changes

- Add a small "👨‍👦 About" button/icon in the page header (near the title)
  that opens a lightweight modal.
- The modal shows a short, celebratory credits message naming both
  developers — Roopesh and Bhavya Suryavanshi — styled to feel special for
  Bhavya (e.g. an emoji/badge and a fun accent color for his name), while
  staying visually consistent with the rest of the site.
- No other pages, data, or behavior change. This is purely additive UI: a
  button, a modal, and a bit of CSS/JS to open/close it.

## Capabilities

### New Capabilities
- `creator-credits`: An "About" entry point (header button) that opens a
  modal displaying attribution for both developers, with a kid-friendly,
  celebratory presentation for the 10-year-old co-developer.

### Modified Capabilities
(none — this does not change search, flashcards, editing, or publishing
behavior)

## Impact

- `index.html`: new header button + new modal markup.
- `styles.css`: styling for the button, modal, and the "special" treatment
  of Bhavya's name (e.g. badge/emoji/accent color).
- `app.js`: open/close wiring for the modal (no data or state changes).
- No impact on `words.json`, existing edit/publish flows, or hosting setup.
