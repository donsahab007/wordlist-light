# creator-credits Specification

## Purpose
Gives the site a small, visible attribution for its two developers — a
parent and his 10-year-old son — so their joint work is acknowledged in a
fun, kid-friendly way without adding weight or complexity to the SPA.
## Requirements
### Requirement: About entry point
The system SHALL provide a small, always-visible "About" control in the
page header that any visitor can select.

#### Scenario: Opening the About view
- **WHEN** a user selects the "About" control in the header
- **THEN** the system displays the credits content (see "Credits content"
  requirement below)

#### Scenario: Closing the About view
- **WHEN** a user closes the credits view (via a close control or an
  equivalent dismiss action)
- **THEN** the credits view is hidden and the user returns to whatever
  view (list or flashcard) they were previously on

### Requirement: Credits content
The About view SHALL name both developers of the site: Roopesh and Bhavya
Suryavanshi.

#### Scenario: Both names shown
- **WHEN** the About view is open
- **THEN** it displays "Roopesh" and "Bhavya Suryavanshi" as the site's
  developers

#### Scenario: Kid-friendly presentation
- **WHEN** the About view is open
- **THEN** Bhavya Suryavanshi's name is presented with a distinct,
  celebratory visual treatment (e.g. an emoji, badge, or accent color)
  that makes it stand out as special, appropriate for a 10-year-old
  co-developer

### Requirement: No impact on core functionality
Adding the About entry point and credits view SHALL NOT alter search,
flashcard, edit-mode, or publish behavior.

#### Scenario: Existing features unaffected
- **WHEN** the About view is added to the page
- **THEN** search, A-Z filtering, flashcard view, edit mode, export, and
  publish continue to behave exactly as before

