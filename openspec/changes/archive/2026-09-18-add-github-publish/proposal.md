## Why

Editing words currently requires a manual three-step loop: export
`words.json`, replace the file in the repo, then commit and push. This is
easy to forget or get out of order, and it means edits are never live until
that manual git dance happens. We want a one-click "publish" path that
keeps the site fully static and serverless, while removing the manual git
steps for the common case.

## What Changes

- New "🚀 Publish to GitHub" action in edit mode: commits the current
  in-memory `words.json` directly to the `main` branch via the GitHub
  Contents API, called from the browser using `fetch`.
- Requires a GitHub Personal Access Token (PAT) with repo write access,
  entered by the user each time they enter edit mode. The token is kept
  only in memory for the current tab/session — never written to
  `localStorage`, never sent anywhere except GitHub's API.
- Existing "⬇ Export words.json" manual download stays as a fallback/backup
  option — **not removed**.
- **MODIFIED**: the existing "No automatic persistence" requirement in
  `word-editing` is updated — edits still don't persist automatically on
  their own, but a new explicit, user-triggered "Publish" action can now
  write them directly to the repository (this is an intentional opt-in
  exception, not automatic background persistence).
- Publishing triggers the existing GitHub Actions Pages workflow
  automatically (no changes needed there) — the live site updates within
  the workflow's normal run time after a successful publish.

## Capabilities

### New Capabilities
- `github-publish`: In-browser publishing of the edited word dataset
  directly to the GitHub repository via the Contents API, using a
  session-only Personal Access Token.

### Modified Capabilities
- `word-editing`: The "No automatic persistence" requirement is updated to
  carve out the new explicit "Publish" action as a user-triggered
  exception; edits still never persist on their own without either Export
  or Publish being explicitly clicked.

## Impact

- Affected files: `app.js` (new publish logic, token prompt/handling),
  `index.html` (new button/token input UI), `README.md` (document token
  scope, risks, and how to create a PAT).
- No changes to hosting, build process, or the GitHub Actions workflow —
  publishing simply creates a new commit on `main`, which the existing
  workflow already deploys.
- New external dependency at runtime: GitHub's REST API (Contents
  endpoint), called directly from the browser — still no custom backend or
  server to run/maintain.
- Security note: this introduces a real credential (GitHub PAT) into the
  browser session, a materially different trust model than the existing
  password gate. Must be clearly documented with scope/rotation guidance.
