# Code-Point-Safe Learner Name Limit

status: completed

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

- Changed learner-name truncation to convert the sanitized value into Unicode
  code points before applying the existing 80-character limit and joining it
  for terminal output.
- Added boundary fixtures proving a non-BMP character remains whole at position
  80 and a 100-character non-BMP name is limited to 80 code points.
- Added current security/maintenance guidance and mutation-sensitive source,
  test, documentation, and completed-plan contracts.

## Verification Completed

- Node 22.22.2 and Node 24.16.0: `npm test`, `npm run lint`, `npm run build`,
  and all Make gates.
- Node 22.22.2 and Node 24.16.0: `npm audit --audit-level=low` and
  `npm pack --dry-run`.
- Confirmed focused hostile mutations to code-point conversion, joining,
  boundary fixtures, documentation, and completed-plan evidence are rejected.
- `git diff --check`
- The intended-path secret and generated-artifact scan passed; prompts,
  examples, clipboard behavior, Twilio integration, dependencies, package
  metadata, workflows, and Node support had no diff.
