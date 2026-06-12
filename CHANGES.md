# Changes

## 2026-06-10

- Raised the maintained runtime contract from Node 10 to supported Node 22+
  and added an `.nvmrc` selecting Node 24 while leaving the oclif/Twilio
  dependency migration separately scoped.
- Retired the obsolete AppVeyor Node 10 configuration in favor of maintained
  GitHub-hosted validation.

## 2026-06-09

- Added stable `make lint`, `make build`, `npm run lint`, and `npm run build`
  aliases for the static training baseline.
- Froze the derived example choice list so prompt options stay aligned with the
  reviewed command catalog.
- Stripped bidirectional formatting controls from displayed learner names and
  added a dependency-free formatter test.
- Added a dependency-free example catalog lookup test and guard for unknown
  example keys.

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
- Added a static check that preserves the executable launcher mode on `bin/run`.
- Included packaged launcher files in the npm package file list.
