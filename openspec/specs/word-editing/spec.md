# word-editing Specification

## Purpose
Lets the single trusted admin add or edit words directly in the browser
behind a simple password gate, then export the updated dataset as a
`words.json` file for manual redeploy — with no server-side persistence.
## Requirements
### Requirement: Password-gated edit mode
The system SHALL require a password to enter edit mode, checked entirely in
the browser (client-side), before any add/edit controls are shown.

#### Scenario: Correct password
- **WHEN** a user enters the correct password
- **THEN** edit mode is enabled and add/edit controls become visible

#### Scenario: Incorrect password
- **WHEN** a user enters an incorrect password
- **THEN** edit mode is NOT enabled and no add/edit controls are shown

#### Scenario: Not real security
- **WHEN** documenting or presenting this feature
- **THEN** the system's documentation SHALL state that the password check is
  a client-side convenience gate only, is visible/bypassable via browser
  devtools, has no recovery mechanism, and is not intended to protect
  sensitive data

### Requirement: Add a word
While in edit mode, the system SHALL let the user add a new word with all
fields: word, meaning, partOfSpeech, example, synonyms, antonyms,
hindiMeaning, difficulty, category.

#### Scenario: Adding a new word
- **WHEN** a user in edit mode submits a form with a word value that does
  not already exist in the dataset
- **THEN** the new word is added to the in-memory dataset and appears
  immediately in the catalog view

#### Scenario: Preventing duplicate words
- **WHEN** a user in edit mode submits a word that already exists
  (case-insensitive match)
- **THEN** the system rejects the submission and shows an error instead of
  creating a duplicate entry

### Requirement: Edit an existing word
While in edit mode, the system SHALL let the user modify any field of an
existing word.

#### Scenario: Editing a word's fields
- **WHEN** a user in edit mode updates the meaning, example, synonyms,
  antonyms, Hindi meaning, difficulty, or category of an existing word and
  saves
- **THEN** the in-memory dataset reflects the updated values immediately

### Requirement: Export updated dataset
While in edit mode, the system SHALL let the user export the current
in-memory word dataset (including all adds/edits) as a downloadable
`words.json` file.

#### Scenario: Exporting after edits
- **WHEN** a user in edit mode has added or edited one or more words and
  selects "Export"
- **THEN** the system produces a downloadable `words.json` file containing
  the full, current word dataset in the same schema used to load it

### Requirement: No automatic persistence
Edits made in edit mode SHALL exist only in the browser's current session
and SHALL NOT be automatically written back to the deployed site.

#### Scenario: Refreshing the page after edits
- **WHEN** a user has added/edited words but not exported and redeployed,
  and then refreshes or reopens the page
- **THEN** the site reflects only the last deployed `words.json`, not the
  unsaved in-session edits

