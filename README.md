# WordList Lite 📚

A tiny, dependency-free, single-page vocabulary app. No backend, no
database, no build step — just static files you can host anywhere,
including GitHub Pages.

Migrated from a larger React/Express/SQLite/Docker app; the ~1,570 words
here are now bundled in a single `words.json` file.

## Features

- 🔍 Search across word, meaning, and Hindi meaning
- 🔤 A–Z alphabet filter
- 📇 Optional flashcard study mode (flip cards, difficulty filter, next/prev)
- 🔐 Password-gated "edit mode" to add/edit words in the browser and export
  an updated `words.json`

## Running locally

Because the app loads `words.json` via `fetch`, most browsers won't allow
that directly from a `file://` path. Serve the folder with any static
file server, for example:

```bash
# Python 3
python -m http.server 8080

# or Node (no install needed)
npx serve .
```

Then open the printed URL (e.g. `http://localhost:8080`).

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, set the source to the `main` branch, root
   folder (`/`).
3. Your site will be published at
   `https://<username>.github.io/<repo-name>/`.

No build step is required — `index.html`, `styles.css`, `app.js`, and
`words.json` are served as-is.

## Editing words

1. Click **🔐 Edit** in the header.
2. Enter the edit-mode password. Default password: `wordlist2024`.
3. Use **+ Add Word** or the **✏️ Edit** button on any word to change its
   fields. Duplicate words (case-insensitive) are rejected.
4. Click **⬇ Export words.json** to download the updated dataset.
5. Replace `words.json` in this repository with the downloaded file and
   commit/push. GitHub Pages will redeploy automatically.

### ⚠️ Important: this is not real security

The edit-mode password check runs entirely in your browser. Anyone with
basic familiarity with browser devtools can bypass it or read the password
hash out of `app.js`. There is:

- No server enforcing the password.
- No account system or per-user permissions.
- **No password recovery.** If you forget the password, you must edit the
  `DEFAULT_PASSWORD_SHA256` constant in `app.js` (with a new SHA-256 hash
  of your new password) and redeploy.

This is intended purely as a convenience gate to prevent accidental edits
by a casual visitor — not to protect sensitive data. Don't rely on it for
anything you wouldn't be comfortable with anyone potentially reading or
editing.

### Changing the password

Open a browser devtools console anywhere and run:

```js
crypto.subtle.digest("SHA-256", new TextEncoder().encode("yourNewPassword"))
  .then(buf => console.log(
    Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
  ));
```

Copy the printed hex string into `DEFAULT_PASSWORD_SHA256` in `app.js`,
then commit, push, and redeploy.

## Data model

Each word in `words.json` has the shape:

```json
{
  "word": "Abate",
  "meaning": "to lessen in intensity",
  "partOfSpeech": "Verb",
  "example": "",
  "synonyms": "subside,diminish",
  "antonyms": "intensify,increase",
  "hindiMeaning": "कम होना",
  "difficulty": "medium",
  "category": "Academic"
}
```

## Project structure

```
wordlist-lite/
├── index.html      # Markup + modals
├── styles.css       # All styling
├── app.js           # All app logic (data load, search, filter, flashcards, edit mode)
├── words.json        # Bundled word dataset (~1,570 words)
└── migrate.py         # One-time migration script (not needed to run the site)
```

## Non-goals

- No user accounts or multi-user editing
- No server API or database
- No build tooling required to run or deploy
- No progress/stats tracking
