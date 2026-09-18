## Context

See proposal.md - Why/What Changes for motivation. Current edit flow
(`app.js`) keeps an in-memory `words` array updated by add/edit forms, with
a manual "Export" button that downloads it as `words.json` via a Blob URL.
There is no existing network call in the app beyond the initial
`fetch("words.json")` on page load. GitHub Pages serves the site from the
repository's default branch (`main`), rebuilt automatically by the existing
`.github/workflows/deploy.yml` on every push to `main`.

## Goals / Non-Goals

**Goals:**
- Let the admin publish edits with one click, from the same static page,
  with no new server or build step.
- Keep the GitHub PAT out of persistent storage - memory-only for the tab's
  lifetime.
- Fail safely: never lose in-browser edits or corrupt the remote file on
  error or conflict.

**Non-Goals:**
- No multi-user conflict resolution UI (e.g. merge tools) - a conflicting
  remote change is surfaced as an error, not auto-merged.
- No token management UI (rotation, scoping, revocation) - users manage
  their own PAT via GitHub's settings, per README guidance.
- No change to the GitHub Actions deploy workflow itself - publishing only
  needs to create a commit; the existing workflow already deploys on push.

## Decisions

- **Use the GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`)
  directly from the browser via `fetch`**, rather than the Git Data API
  (blobs/trees/commits) or a GitHub App/OAuth flow. Rationale: the Contents
  API is a single call for "update this one file with this content," which
  matches our use case exactly (one file, one commit) and requires only a
  PAT with `repo` (or fine-grained `contents:write`) scope - no server-side
  OAuth exchange needed. Alternative considered: GitHub Data API - rejected
  as unnecessarily complex (multiple calls to create a blob, tree, and
  commit) for updating a single file.
- **Determine owner/repo/branch from configuration in `app.js`**, not
  auto-detected from `location.hostname`, since GitHub Pages project URLs
  (`username.github.io/repo-name`) don't reliably map back to the
  owner/repo pair (e.g. custom domains, user vs. org pages). A small
  constant block (`GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`) mirrors
  the existing `PASSWORD_*` constants pattern already in the file.
- **Fetch the current file's SHA immediately before publishing** (via
  `GET /repos/{owner}/{repo}/contents/{path}`) and pass it as the `sha`
  parameter on the `PUT` call. This satisfies the Contents API's required
  concurrency check: GitHub rejects the write with a 409 if the file has
  changed since that SHA was read, which is exactly the "detect conflict"
  behavior specced. Alternative considered: skip the SHA check and always
  force-overwrite - rejected because it could silently destroy a
  concurrent edit (e.g. from a manual git push) with no warning.
- **PAT stored in a JS variable (module-level, in-memory) only**, requested
  via a prompt/modal the first time "Publish" is used in edit mode (or
  whenever it's missing/invalid). Never written to `localStorage`,
  `sessionStorage`, or cookies, and cleared automatically when the tab is
  closed or reloaded (nothing to explicitly clear - it just doesn't
  persist). Alternative considered: `sessionStorage` - rejected per user's
  explicit "session_only" / re-enter-each-time decision, since even
  `sessionStorage` is readable by any script/extension in that origin for
  the tab's lifetime and the user preferred minimizing that window further
  to "as long as this JS is loaded," not stored at all.
- **Base64-encode the JSON content client-side** before sending, since the
  Contents API requires file content as base64. Use `TextEncoder` +
  standard base64 conversion (not `btoa` directly, to correctly handle
  UTF-8 characters like the Hindi meanings already in the dataset).
- **Keep "Export" as a permanent fallback**, unchanged - Publish is
  additive, not a replacement.

## Risks / Trade-offs

- [Risk] A GitHub PAT with repo write access is a much higher-value secret
  than the existing password gate - if leaked, it grants real write access
  to the repository (not just this app's UI) → Mitigation: never persisted
  to storage; documented prominently in README with guidance to use a
  fine-grained token scoped only to this one repository with only
  `contents: write` permission, and to set a short expiration.
- [Risk] Browser `fetch` calls to the GitHub API expose the PAT in the
  browser's network tab/devtools for the duration of the session →
  Mitigation: accepted, consistent with the existing "trust the person
  using edit mode" model; documented clearly.
- [Risk] Publishing directly to `main` with no review step means a bad edit
  goes live as soon as the Pages workflow runs → Mitigation: out of scope
  for this change (matches the existing manual-export flow's same risk);
  could be revisited later (e.g. a PR-based publish flow) as a separate
  enhancement.
- [Risk] Rate limits on the GitHub API for unauthenticated vs. authenticated
  calls → Mitigation: not a concern here since all calls are authenticated
  with the user's PAT, which has generous authenticated rate limits for
  this low-frequency use case (a few edits at a time).

## Migration Plan

1. Add `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` constants to `app.js`.
2. Implement the publish flow: prompt for PAT (in-memory only) → fetch
   current file SHA → base64-encode updated `words.json` → `PUT` to the
   Contents API with the commit message from the proposal → surface
   success/failure to the user.
3. Add the "🚀 Publish to GitHub" button next to the existing "⬇ Export"
   button in the edit toolbar.
4. Update README with PAT creation guidance (fine-grained token, `contents:
   write` scope, short expiration) and the security trade-off explanation.
5. No workflow changes needed - the existing `deploy.yml` already deploys
   on every push to `main`, so a successful publish triggers a normal
   deploy automatically.
- Rollback: this is purely additive to `app.js`/`index.html`/`README.md`;
  reverting the commit that introduces this feature fully removes it with
  no data migration concerns (nothing changes about `words.json`'s schema).
