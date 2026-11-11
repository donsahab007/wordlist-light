## ADDED Requirements

### Requirement: Metadata dropdown choices
The Add/Edit Word form SHALL present Part of Speech and Category as dropdowns
instead of free-text fields. Both SHALL allow an empty selection and SHALL NOT
offer an Other option or a way to enter an unlisted value.

The Part of Speech dropdown SHALL offer Noun, Pronoun, Verb, Adjective, Adverb,
Preposition, Conjunction, Interjection, and Determiner. The Category dropdown
SHALL offer Academic, Legal, Abstract, Science, Emotion, Politics, Literature,
Business, Social, Nature, Character, and Feeling.

Both dropdowns SHALL additionally offer any non-empty values already present
in the current vocabulary dataset, preserving their exact spelling and case.
Opening the form SHALL NOT modify existing word data.

#### Scenario: Adding a word using listed metadata
- **WHEN** an admin opens Add Word and selects a listed part of speech and category
- **THEN** the saved word contains those selected values
- **AND** those values are retained in exported or published word data

#### Scenario: Leaving optional metadata blank
- **WHEN** an admin opens Add Word
- **THEN** both metadata dropdowns initially have an empty selection
- **AND** the admin can save a word with empty part of speech and category when
  the required word and meaning are supplied

#### Scenario: Preserving legacy metadata
- **WHEN** an admin edits a word with existing metadata such as part of speech
  "noun" or category "feeling" and saves without changing those selections
- **THEN** the word retains those exact values rather than being cleared or
  normalized

#### Scenario: Preserving additional dataset choices
- **WHEN** the current dataset contains a non-empty metadata value outside the
  predefined lists
- **THEN** that value is available in the corresponding dropdown for adding
  and editing words

#### Scenario: Clearing metadata during editing
- **WHEN** an admin selects the empty option for a populated metadata field and saves
- **THEN** that field is saved as an empty string

#### Scenario: Restricting entry to listed values
- **WHEN** an admin interacts with either metadata dropdown
- **THEN** the form allows selection from listed values only and presents no
  custom-value entry control
