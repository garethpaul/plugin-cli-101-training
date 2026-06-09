# Welcome Name Normalization

status: completed

## Context

The welcome command asks learners for a name and echoes it to the terminal. Raw
prompt input can include terminal control characters or excessive length, which
is unnecessary for display-only training output.

## Objectives

- Add `formatLearnerName` for welcome prompt output.
- Strip terminal control characters from learner names.
- Trim empty input and fall back to a neutral greeting.
- Cap displayed learner names at 80 characters.
- Extend the static baseline and docs for prompt-output handling.

## Verification

- `npm run check`
- `npm test`
- `make check`
- `node scripts/check-baseline.js`
- `git diff --check`
