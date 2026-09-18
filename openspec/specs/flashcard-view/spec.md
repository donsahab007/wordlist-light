# flashcard-view Specification

## Purpose
Gives a user an optional flip-card study mode over the currently
searched/filtered word set, for quick recall practice.
## Requirements
### Requirement: Flashcard mode toggle
The system SHALL let a user switch between the list view and a flashcard
view for the current filtered/searched set of words.

#### Scenario: Entering flashcard mode
- **WHEN** a user activates flashcard mode with an active search or letter
  filter applied
- **THEN** only the currently matching words are used for the flashcard deck

### Requirement: Card flip
The system SHALL show the word first and reveal its meaning (and other
metadata) only after the user flips the card.

#### Scenario: Flipping a card
- **WHEN** a user taps/clicks the card
- **THEN** the card flips to show meaning, part of speech, example,
  synonyms, antonyms, Hindi meaning, difficulty, and category

### Requirement: Deck navigation
The system SHALL let a user move to the next or previous card in the deck.

#### Scenario: Navigating forward
- **WHEN** a user selects "next" on the last card
- **THEN** the system wraps to the first card or clearly indicates the deck
  has ended (either behavior is acceptable, but it MUST NOT error or freeze)

#### Scenario: Navigating backward
- **WHEN** a user selects "previous" on the first card
- **THEN** the system wraps to the last card or clearly indicates there is
  no previous card

### Requirement: Difficulty filter within flashcards
The system SHALL let a user restrict the flashcard deck to a chosen
difficulty level (easy, medium, hard) or all levels.

#### Scenario: Filtering deck by difficulty
- **WHEN** a user selects "hard" as the difficulty filter in flashcard mode
- **THEN** only words with difficulty "hard" (within the current
  search/letter filter) appear in the deck

