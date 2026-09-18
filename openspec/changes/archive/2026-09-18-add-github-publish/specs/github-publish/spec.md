## Purpose

Lets the site's admin publish edits made in the browser directly to the
GitHub repository as a new commit, so the live site updates without a
manual export/replace/commit/push cycle.

## ADDED Requirements

### Requirement: Publish action in edit mode
While in edit mode, the system SHALL provide a "Publish" action that
commits the current in-memory word dataset directly to the repository's
default branch via GitHub's REST API, called from the browser.

#### Scenario: Successful publish
- **WHEN** a user in edit mode has added or edited one or more words and
  selects "Publish"
- **THEN** the system commits the updated `words.json` to the repository's
  default branch and confirms success to the user

#### Scenario: Publish with no changes
- **WHEN** a user in edit mode selects "Publish" without having made any
  changes
- **THEN** the system SHALL still allow the action to proceed (idempotent),
  or clearly indicate there is nothing new to publish

### Requirement: Session-only GitHub token
The system SHALL require a GitHub Personal Access Token (PAT) with
repository write access to perform a publish, and SHALL NOT persist that
token beyond the current browser tab/session (e.g. no `localStorage` or
cookie storage).

#### Scenario: Entering a token
- **WHEN** a user enters edit mode and attempts to publish for the first
  time in that session
- **THEN** the system prompts for a GitHub PAT before attempting the commit

#### Scenario: Token not retained across sessions
- **WHEN** a user closes the tab or reloads the page after publishing
- **THEN** the previously entered token is no longer available and must be
  re-entered to publish again

### Requirement: Publish failure handling
The system SHALL detect and clearly report failures from the GitHub API
(e.g. invalid token, insufficient permissions, network failure, conflicting
remote changes) without silently losing the user's in-browser edits.

#### Scenario: Invalid or insufficient token
- **WHEN** the GitHub API rejects the publish due to an invalid token or
  missing write permission
- **THEN** the system shows a clear error message and the in-memory edits
  remain intact for the user to retry or fall back to manual export

#### Scenario: Remote file changed since last load
- **WHEN** the repository's `words.json` has changed since the page was
  loaded (e.g. edited by someone else or from another session)
- **THEN** the system SHALL detect the conflict via the file's current
  version identifier and refuse to silently overwrite it, informing the
  user instead of corrupting remote history

### Requirement: Manual export remains available
The existing manual "Export words.json" download SHALL remain available as
a fallback alongside the new Publish action.

#### Scenario: Exporting without publishing
- **WHEN** a user prefers not to provide a GitHub token
- **THEN** the user can still export `words.json` manually as before
