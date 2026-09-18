## Why

The existing WordList app (React + Express + SQLite + Docker, 3 containers) is
too heavy to host for what is fundamentally a personal, single-admin
vocabulary reference. We want a version that is trivial to deploy (static
files only, e.g. GitHub Pages) while keeping the ~1600-word dataset and the
features that matter day-to-day: searching, browsing by letter, and
occasionally adding or correcting a word.

## What Changes

- New static, zero-backend, zero-build single-page app (vanilla HTML/CSS/JS).
- All ~1600 words migrated from `WordList_2/backend/words-data.json` (or its
  SQLite export) into a single bundled `words.json` asset.
- Client-side search across word / meaning / Hindi meaning.
- A–Z alphabet filter for browsing.
- Optional flashcard view (flip card, next/prev).
- Single-password client-side "edit mode": add/edit a word in-browser, then
  export a regenerated `words.json` for the user to manually commit and push.
  **BREAKING** (relative to old app): no server-side persistence, no JWT auth,
  no multi-user support, no password recovery — edit mode is a convenience
  gate only, not real security.
- Drops: stats/progress tracking, admin JWT auth, Docker, backend API,
  database.

## Capabilities

### New Capabilities
- `word-catalog`: Loading the bundled word dataset and browsing/searching/
  filtering it (search box, A–Z filter, word list/detail display).
- `flashcard-view`: Optional flip-card study mode over the current
  filtered/searched word set.
- `word-editing`: Password-gated add/edit of words in-browser and exporting
  an updated `words.json` file for manual redeploy.

### Modified Capabilities
- None (new project; no existing specs to modify).

## Impact

- Affected: entirely new repository (`wordlist-lite`), no shared code with
  `WordList_2`.
- Data: one-time migration/export of existing word data into `words.json`.
- Removed systems (not carried over): Express API, SQLite database, JWT/
  bcrypt auth, Docker Compose, React/Vite build pipeline.
- Hosting: static hosting only (GitHub Pages or equivalent) — no server to
  provision or maintain.
