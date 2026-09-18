## Context

See proposal.md - Why. This is a small, additive, purely front-end feature
in a vanilla HTML/CSS/JS SPA with no build step. It follows the same
modal pattern already used for the password prompt, word form, token
prompt, and publish status (a hidden `<div class="modal">` toggled via a
`hidden` class, wired up in `app.js`).

## Goals / Non-Goals

**Goals:**
- Add a header "About" button and a credits modal reusing the existing
  modal CSS/JS conventions already in the codebase.
- Make Bhavya Suryavanshi's name visually stand out (kid-friendly, proud,
  fun) while keeping the overall site's simple/clean look.

**Non-Goals:**
- No animations library, no new dependencies, no images/avatars requiring
  extra assets (an emoji is sufficient and keeps the page weight at zero
  added bytes of consequence).
- Not a general "credits/contributors" system for arbitrary future
  contributors — just this one static, hardcoded credit.

## Decisions

- **Reuse the existing modal pattern** (same as `#tokenModal` /
  `#publishStatusModal`): a hidden `<div id="aboutModal" class="modal
  hidden">` with a close button, toggled via `classList` in `app.js`.
  Rationale: zero new patterns/CSS to maintain, consistent with the rest
  of the app.
- **Static content, no data file**: names and styling are hardcoded
  directly in `index.html`/`styles.css` since this is a fixed, personal
  credit — not data that needs to be editable via the existing word-editing
  flow. Rationale: keeps things simple; avoids conflating "site content"
  with "word dataset" edited via the password-gated edit mode.
- **Kid-friendly treatment for Bhavya's name**: a `<span class="credit-kid">`
  with a distinct accent color and a trailing emoji badge (e.g. 🌟 or 🚀),
  defined in `styles.css`. Rationale: simple CSS-only touch achieves the
  "feel proud" goal without extra assets or complexity.
- **Header placement**: a small "ℹ️ About" (or similar icon+label) button
  next to the existing view-toggle/edit buttons in the header toolbar,
  visible to all visitors (not gated behind edit mode) since credits are
  not sensitive.

## Risks / Trade-offs

- [Risk] Hardcoding names in markup means any future name change requires
  editing code, not just data → Acceptable: this is a personal, rarely
  changing credit, not user data.
- [Risk] Adding another header button could clutter the toolbar on small
  screens → Mitigate by keeping the button compact (icon + short label)
  and reusing existing responsive toolbar CSS/wrapping behavior.
