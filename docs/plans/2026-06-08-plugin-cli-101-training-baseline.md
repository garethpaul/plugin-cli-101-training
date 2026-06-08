# Plugin CLI 101 Training Baseline Plan

status: completed

## Context

`plugin-cli-101-training` is an oclif-based Twilio CLI plugin used for training
commands, examples, welcome text, and feedback links.

## Risks

- Training examples can be copied into live Twilio accounts.
- Real-looking phone numbers and purchase/update examples can cause confusion
  or unintended account changes.
- Training-only commands imported credential-aware Twilio client classes.
- `npm test` depended on absent test files, coverage thresholds, and `npm audit`
  despite no committed lockfile.

## Work Completed

- Added `scripts/check-baseline.js`, `npm run check`, and `npm test`.
- Replaced real-looking phone numbers with fake placeholder values.
- Replaced the phone-number purchase command with a search command.
- Changed the webhook update command to use an explicit placeholder for the
  Twilio number.
- Removed credential-aware base classes from welcome and feedback commands.
- Removed remote Codecov script download/execution from AppVeyor.
- Documented safe training usage, clipboard behavior, and side-effect review.

## Verification

- `npm run check`
- `npm test`
- `node scripts/check-baseline.js`
- `git diff --check`
