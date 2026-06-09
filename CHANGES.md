# Changes

## 2026-06-08

- Added a root `make check` wrapper for the static baseline.
- Added `npm run check` and `npm test` static baseline verification.
- Replaced real-looking Twilio phone-number examples with fake placeholder
  numbers.
- Replaced the phone-number purchase example with a search example.
- Changed the webhook update example to require an explicit placeholder number
  replacement.
- Removed credential-aware Twilio client base classes from training-only
  commands.
- Removed remote Codecov script execution from AppVeyor.
- Added docs and checks that make side effects, placeholders, and clipboard
  behavior explicit.
- Made example-command clipboard writes opt-in with `--copy`.
- Sanitized learner names before the welcome command echoes them to the
  terminal.
- Froze the fake placeholder example catalog to keep training commands stable.
