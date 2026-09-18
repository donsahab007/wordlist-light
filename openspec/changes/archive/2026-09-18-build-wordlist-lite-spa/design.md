## Context

Source data lives in `WordList_2/backend/words-data.json` / SQLite
(`data/wordlist.db`), ~1600 words with fields: word, meaning, partOfSpeech,
example, synonyms, antonyms, hindiMeaning, difficulty, category. See
proposal.md for why we're moving away from the React/Express/SQLite/Docker
stack. This design covers the new static app's structure and the one-time
migration.

## Goals / Non-Goals

**Goals:**
- Ship as static files only: `index.html`, one or a few `.js`/`.css` files,
  and `words.json` — deployable by pushing to a GitHub Pages branch/folder
  with zero build step.
- Keep the whole dataset (~1600 words) in a single JSON payload loaded once.
- Support search, A-Z filter, optional flashcards, and edit+export, all
  client-side.

**Non-Goals:**
- No server-side validation, storage, or multi-user sync.
- No build tooling (bundlers, transpilers, package manager at runtime) —
  a package.json may exist only for optional dev tooling (e.g. a local
  static server or linter), never required to run the site.
- No attempt to make the edit-mode password cryptographically secure.

## Decisions

- **Vanilla JS, no framework**: confirmed by user for smallest footprint and
  simplest hosting. Alternative considered: Preact/Lit — rejected to avoid
  any build step at all.
- **Single `words.json` bundled with the site** (not fetched from an
  external API): keeps the app fully static and offline-capable after first
  load. Alternative considered: fetch from a headless CMS/serverless DB —
  rejected, reintroduces a network dependency and moving parts for a
  single-admin use case.
- **Edit mode = in-memory + manual export**: edits update a JS in-memory
  copy of the dataset; "Export" serializes it back to `words.json` via a
  Blob download. The user replaces the file in the repo and pushes.
  Alternative considered: write directly to GitHub via the GitHub API from
  the browser using a personal access token — rejected as it would require
  storing a token client-side, which is a bigger security liability than the
  simple password gate, for marginal convenience gain.
- **Password gate implemented as a plain client-side check** (e.g. a
  hardcoded hash compared against user input): explicitly documented as a
  UI speed bump, not access control. Alternative considered: no gate at all
  — rejected because an accidental click on "Add word" controls should not
  be one click away for a casual visitor.
- **Data migration**: a one-time Node or Python script (run locally, not
  shipped with the site) reads the existing SQLite DB or
  `words-data.json` and writes the new repo's `words.json` in the same
  field shape. This script is a build/dev-time tool, not part of the
  deployed app.

## Risks / Trade-offs

- [Risk] Client-side password is trivially bypassable via devtools →
  Mitigation: documented clearly in README and in the spec; acceptable
  because only the owner uses edit mode and the data is low-stakes.
- [Risk] Forgetting to export/redeploy after editing loses changes on
  refresh → Mitigation: edit mode UI should visibly prompt "Export before
  leaving" when there are unsaved changes.
- [Risk] Large `words.json` (~1600 entries) loaded synchronously could delay
  first render on slow connections → Mitigation: keep JSON minified, avoid
  unnecessary fields, lazy-render list (only render visible portion) if
  performance testing shows an issue.
- [Risk] No password recovery — if forgotten, edit mode is permanently
  inaccessible without redeploying a new hardcoded password → Mitigation:
  accepted per user's explicit decision; note in README that changing the
  password requires editing source and redeploying.

## Migration Plan

1. Write/export the ~1600 words from `WordList_2` into the new repo's
   `words.json`, preserving all required fields.
2. Build the static site (`index.html` + JS/CSS) against that `words.json`.
3. Deploy to GitHub Pages (or equivalent static host) from the repo.
4. Verify search, alphabet filter, flashcards, and edit+export all work
   against the full migrated dataset before considering migration done.
- Rollback: since this is a new, separate repository, rollback is simply
  not switching the hosting/DNS over from (or continuing to run) the old
  `WordList_2` app — no shared state to unwind.
