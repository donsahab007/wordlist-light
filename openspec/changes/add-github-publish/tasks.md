## 1. Configuration & Token Handling

- [x] 1.1 Add `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, and
      `GITHUB_FILE_PATH` constants to `app.js`
- [x] 1.2 Implement an in-memory-only token variable (no localStorage/
      sessionStorage/cookies) and a prompt/modal to collect the PAT the
      first time "Publish" is used in a session
- [x] 1.3 Implement UTF-8-safe base64 encoding helper for the words.json
      content (using `TextEncoder`, not raw `btoa`)

## 2. Publish Flow

- [x] 2.1 Implement "fetch current file SHA" call
      (`GET /repos/{owner}/{repo}/contents/{path}`)
- [x] 2.2 Implement the publish commit call
      (`PUT /repos/{owner}/{repo}/contents/{path}`) with the configured
      commit message, branch, base64 content, and fetched SHA
- [x] 2.3 Add "🚀 Publish to GitHub" button to the edit toolbar, next to
      the existing "⬇ Export" button
- [x] 2.4 Wire the button to: prompt for token if missing → fetch SHA →
      publish → show success/failure feedback to the user

## 3. Error Handling

- [x] 3.1 Handle invalid/insufficient token errors (e.g. 401/403 from
      GitHub) with a clear message; keep in-memory edits intact
- [x] 3.2 Handle SHA conflict (409) when the remote file changed since
      load; show a clear message instead of silently overwriting
- [x] 3.3 Handle generic network/API failures gracefully without losing
      in-browser edits
- [x] 3.4 Verify "Publish with no changes" still succeeds or clearly
      indicates nothing new to publish

## 4. Documentation

- [x] 4.1 Update README with: how to create a fine-grained GitHub PAT
      scoped to this repo with `contents: write` permission and a short
      expiration
- [x] 4.2 Document in README that the token is session/tab-memory-only and
      is a materially more sensitive credential than the edit-mode
      password, with guidance not to reuse a broadly-scoped token
- [x] 4.3 Document that "Export" remains available for users who prefer
      not to provide a token

## 5. Verification

- [ ] 5.1 Manually verify: enter edit mode, add/edit a word, publish with a
      valid fine-grained PAT, confirm a new commit appears on `main` and
      the GitHub Actions deploy runs automatically
- [ ] 5.2 Manually verify: publish with an invalid/expired token produces a
      clear error and does not lose in-browser edits
- [ ] 5.3 Manually verify: simulate a remote change (edit `words.json`
      directly on GitHub) then attempt to publish from a stale local
      session and confirm the conflict is surfaced, not silently
      overwritten
- [ ] 5.4 Manually verify: reload the page after publishing and confirm the
      token must be re-entered (i.e. it was not persisted)
- [ ] 5.5 Manually verify the existing manual "Export" flow still works
      unchanged
