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
2. Enter the edit-mode password (set by whoever deployed this site — see
   "Changing the password" below if you need to update or don't know it).
3. Use **+ Add Word** or the **✏️ Edit** button on any word to change its
   fields. Duplicate words (case-insensitive) are rejected.
4. Click **⬇ Export words.json** to download the updated dataset.
5. Replace `words.json` in this repository with the downloaded file and
   commit/push. GitHub Pages will redeploy automatically.

### ⚠️ Important: this is not real security

The edit-mode password check runs entirely in your browser using PBKDF2
(SHA-256, 150,000 iterations, random salt) instead of a single fast hash —
this slows down offline brute-forcing, but the salt and resulting hash are
still visible in `app.js` to anyone who views page source. There is:

- No server enforcing the password.
- No account system or per-user permissions.
- **No password recovery.** If you forget the password, you must generate
  a new salt/hash pair (see below) and redeploy.

This is intended purely as a convenience gate to prevent accidental edits
by a casual visitor — not to protect sensitive data. Don't rely on it for
anything you wouldn't be comfortable with anyone potentially reading or
editing.

### Changing the password

Run this with Node.js (it uses the same Web Crypto API available in
browsers):

```bash
node -e "
const crypto = require('crypto').webcrypto;
(async () => {
  const password = 'yourNewPassword';
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const iterations = 150000;
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, 256);
  const hex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  console.log('SALT_HEX =', hex(salt));
  console.log('ITERATIONS =', iterations);
  console.log('HASH_HEX =', hex(bits));
})();
"
```

Copy the three printed values into `PASSWORD_SALT_HEX`, `PASSWORD_ITERATIONS`,
and `PASSWORD_HASH_HEX` in `app.js`, then commit, push, and redeploy.

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
