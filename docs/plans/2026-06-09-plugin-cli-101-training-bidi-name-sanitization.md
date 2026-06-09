# Bidi Name Sanitization

status: completed
date: 2026-06-09

## Context

The welcome command already stripped ASCII terminal control characters from
learner names before echoing them. Unicode bidirectional formatting controls
can still visually reorder terminal text, so display-only prompt input should
remove those controls too.

## Changes

- Added a Unicode bidi-control removal step to `formatLearnerName`.
- Added `test_welcome_name_format.js` as a dependency-free formatter test with
  local stubs for the command module dependencies.
- Updated `npm test` and the static baseline checker to keep the new
  sanitization contract covered.

## Verification

- `npm test`
- `npm run check`
- `npm run lint`
- `npm run build`
- `make check`
