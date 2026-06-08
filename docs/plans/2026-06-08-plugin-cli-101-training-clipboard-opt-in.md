# Plugin CLI 101 Training Clipboard Opt-In Plan

status: completed

## Context

The `cli-101-training:examples` command prints Twilio CLI examples for learners
to review and run. The baseline already uses fake placeholder values, but the
command still copied examples to the local clipboard by default.

## Risk

Automatic clipboard writes make it easier for a learner to paste and run a
command before noticing placeholder phone numbers, webhook URLs, or side
effects.

## Work Completed

- Added an explicit `--copy` flag to `cli-101-training:examples`.
- Kept examples printable by default without changing the local clipboard.
- Kept `clipboardy.writeSync` only on the reviewed opt-in path.
- Updated docs and the static baseline checker to enforce the opt-in behavior.

## Verification

- `npm run check`
- `node scripts/check-baseline.js`
- `git diff --check`
