## 1. Markup

- [x] 1.1 Add an "ℹ️ About" button to the header toolbar in `index.html`,
      next to the existing view-toggle/edit buttons
- [x] 1.2 Add a new `#aboutModal` (hidden by default) reusing the existing
      modal markup pattern, with a close button
- [x] 1.3 Add the credits content inside the modal: "Roopesh" and
      "Bhavya Suryavanshi" as the site's developers, with Bhavya's name
      wrapped in a distinct `<span class="credit-kid">` for special styling

## 2. Styling

- [x] 2.1 Style the About button consistent with existing header buttons
- [x] 2.2 Style `.credit-kid` with an accent color and a celebratory emoji
      badge (e.g. 🌟/🚀) so Bhavya's name stands out
- [x] 2.3 Verify the modal and button look good on both desktop and small
      (mobile) screen widths, matching existing responsive behavior

## 3. Behavior

- [x] 3.1 Wire the About button to open `#aboutModal`
- [x] 3.2 Wire the modal's close button (and existing modal-dismiss
      conventions, e.g. clicking outside/Escape if already supported by
      other modals) to hide `#aboutModal`
- [x] 3.3 Confirm opening/closing the About modal does not affect
      search, flashcard, edit mode, export, or publish state

## 4. Verification

- [x] 4.1 Manually verify: About button is visible on page load without
      needing edit-mode password
- [x] 4.2 Manually verify: opening the modal shows both names, with
      Bhavya Suryavanshi's name visually distinct/celebratory
- [x] 4.3 Manually verify: closing the modal returns cleanly to the
      previous view with no console errors
