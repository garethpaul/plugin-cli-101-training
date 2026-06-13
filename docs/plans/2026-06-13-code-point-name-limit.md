# Code-Point-Safe Learner Name Limit

status: pending

## Context

Learner names are bounded with JavaScript string `slice`, which counts UTF-16
code units. A non-BMP character crossing the 80-unit boundary can be split into
a lone surrogate before terminal output.

## Requirements

- Keep the existing 80-character learner-name limit.
- Truncate sanitized names by Unicode code points rather than UTF-16 code units.
- Preserve trimming, empty-name fallback, and Unicode control/format removal.
- Add boundary tests proving a non-BMP character is retained whole and excess
  trailing input is removed.
- Add mutation-sensitive source, test, documentation, and completed-plan
  contracts.

## Scope Boundaries

- Do not change prompts, welcome output, examples, clipboard behavior, Twilio
  integration, dependencies, package files, workflows, or Node support.

## Work Completed

Pending implementation.

## Verification Completed

Pending implementation and validation.
