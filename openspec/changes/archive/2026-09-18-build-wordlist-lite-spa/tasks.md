## 1. Data Migration

- [x] 1.1 Write a one-time migration script (Node or Python) to read
      `WordList_2/backend/words-data.json` (or export from
      `data/wordlist.db`) and produce `words.json` with fields: word,
      meaning, partOfSpeech, example, synonyms, antonyms, hindiMeaning,
      difficulty, category
- [x] 1.2 Run the script and verify the output contains all ~1600 words with
      no missing/malformed entries
- [x] 1.3 Place the generated `words.json` in the new repo's static assets
      folder

## 2. Project Scaffold

- [x] 2.1 Create `index.html`, `styles.css`, and `app.js` (or a few small
      JS modules) with no build step required
- [x] 2.2 Add a minimal README describing what the site is, how to run it
      locally (e.g. any static file server), and how to deploy to GitHub
      Pages
- [x] 2.3 Set up GitHub Pages deployment (e.g. `gh-pages` branch or
      `docs/` folder, per repo hosting choice)

## 3. Word Catalog (search + alphabet filter)

- [x] 3.1 Load `words.json` on page load and render the full word list
- [x] 3.2 Implement word detail display (meaning, part of speech, example,
      synonyms, antonyms, Hindi meaning, difficulty, category)
- [x] 3.3 Implement search box filtering across word, meaning, and Hindi
      meaning (case-insensitive)
- [x] 3.4 Implement A-Z alphabet filter UI and logic
- [x] 3.5 Ensure search and alphabet filter combine correctly (AND logic)
- [x] 3.6 Handle and display an error state if `words.json` fails to load
- [x] 3.7 Verify catalog remains responsive with the full ~1600-word
      dataset (basic manual performance check)

## 4. Flashcard View

- [x] 4.1 Add a toggle between list view and flashcard view
- [x] 4.2 Implement flashcard deck sourced from the current
      search/letter-filtered word set
- [x] 4.3 Implement flip interaction (word front, full metadata on back)
- [x] 4.4 Implement next/previous navigation with defined behavior at deck
      boundaries
- [x] 4.5 Implement difficulty filter (easy/medium/hard/all) within
      flashcard mode

## 5. Word Editing (password-gated add/edit + export)

- [x] 5.1 Implement client-side password gate to enter edit mode
- [x] 5.2 Implement "Add word" form covering all fields, with duplicate-word
      prevention (case-insensitive)
- [x] 5.3 Implement "Edit word" form to modify an existing word's fields
- [x] 5.4 Keep an in-memory copy of the dataset that reflects add/edit
      changes immediately in the catalog view
- [x] 5.5 Implement "Export words.json" that downloads the current
      in-memory dataset in the original schema
- [x] 5.6 Add an unsaved-changes indicator/prompt when edit mode has
      pending changes not yet exported
- [x] 5.7 Document in the README that the password gate is client-side only,
      not real security, and has no recovery mechanism

## 6. Verification

- [x] 6.1 Manually verify search, alphabet filter, flashcards, and
      edit+export against the full migrated dataset
- [x] 6.2 Verify the site loads and functions correctly when served purely
      as static files (no dev server features relied upon)
- [x] 6.3 Deploy to GitHub Pages and verify the live URL works end-to-end
