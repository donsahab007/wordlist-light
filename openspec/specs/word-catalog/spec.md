# word-catalog Specification

## Purpose
Lets a visitor load the bundled vocabulary dataset and browse, search, and
filter it by letter entirely in the browser, with no network calls after the
initial page load.
## Requirements
### Requirement: Bundled dataset load
The system SHALL load the full word dataset from a single bundled
`words.json` file at page load, without requiring any server API call.

#### Scenario: Dataset loads on page open
- **WHEN** the page is opened (e.g. via GitHub Pages URL)
- **THEN** all words from `words.json` are available in the UI without any
  further network request

#### Scenario: Dataset fails to load
- **WHEN** `words.json` is missing or fails to parse
- **THEN** the system displays a clear error message instead of a blank or
  broken page

### Requirement: Word list display
The system SHALL display words with their metadata: meaning, part of speech,
example, synonyms, antonyms, Hindi meaning, difficulty, and category.

#### Scenario: Viewing a word's details
- **WHEN** a user selects or expands a word in the list
- **THEN** its meaning, part of speech, example, synonyms, antonyms, Hindi
  meaning, difficulty, and category are shown

### Requirement: Text search
The system SHALL let a user filter the visible word list by typing a search
term that matches against word, meaning, or Hindi meaning, case-insensitively.

#### Scenario: Searching by word
- **WHEN** a user types a partial word (e.g. "elo") into the search box
- **THEN** only words whose word, meaning, or Hindi meaning contain that
  text (case-insensitively) remain visible

#### Scenario: Clearing search
- **WHEN** a user clears the search box
- **THEN** the full (or currently alphabet-filtered) word list is shown again

### Requirement: Alphabet filter
The system SHALL let a user filter the word list to only words starting with
a selected letter A-Z.

#### Scenario: Filtering by letter
- **WHEN** a user selects the letter "M"
- **THEN** only words starting with "M" (case-insensitive) are shown

#### Scenario: Combining search and alphabet filter
- **WHEN** a user has selected a letter filter and also enters a search term
- **THEN** only words matching both the letter and the search term are shown

### Requirement: No word data loss on read
Browsing, searching, and filtering SHALL be read-only operations against the
in-memory dataset and SHALL NOT modify `words.json` or any stored data.

#### Scenario: Read-only browsing
- **WHEN** a user searches, filters, or views word details
- **THEN** the underlying word dataset remains unchanged

