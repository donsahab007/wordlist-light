## MODIFIED Requirements

### Requirement: No automatic persistence
Edits made in edit mode SHALL exist only in the browser's current session
and SHALL NOT be automatically written back to the deployed site, except
when the user explicitly triggers the "Publish" action (see the
`github-publish` capability), which is itself an explicit, user-initiated
write — not automatic background persistence.

#### Scenario: Refreshing the page after edits
- **WHEN** a user has added/edited words but has not exported or published,
  and then refreshes or reopens the page
- **THEN** the site reflects only the last deployed `words.json`, not the
  unsaved in-session edits

#### Scenario: Publishing is explicit, not automatic
- **WHEN** a user adds or edits a word in edit mode
- **THEN** the system SHALL NOT automatically publish or persist that
  change anywhere; publishing SHALL require the user to explicitly select
  "Publish"
