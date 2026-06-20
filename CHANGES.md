# Changes

## 2026-06-20

- Overrode both legacy oclif parser paths with patched `js-yaml 4.2.0` while
  preserving the direct Twilio CLI Core and oclif compatibility versions.
- Replaced the temporary reviewed-advisory allowance with a fail-closed audit
  contract requiring zero known vulnerabilities.
- Added a launcher preload and regression coverage for the legacy oclif
  `safeLoad` and `safeDump` aliases removed by js-yaml 4.

## 2026-06-17

- Made the 80-character learner-name limit truncate by grapheme clusters so
  flags and combining sequences remain intact at the boundary.
- Raised the Node 22 compatibility floor to 22.13, the first release that loads
  the Twilio/oclif host's ESM-only Octokit dependency without an opt-in flag or
  an experimental warning.
- Pinned the hosted Node 22 lane to 22.13.0 so CI tests the declared floor instead
  of silently floating to a newer compatible patch.

## 2026-06-15

- Removed Unicode line and paragraph separators from learner names before
  terminal output.
- Overrode vulnerable `form-data` with 4.0.6 and documented the remaining
  js-yaml upstream blocker without breaking the Twilio/oclif host contract.
- Kept hosted dependency audits fail-closed while allowing only the exact
  reviewed moderate js-yaml advisory chain that is blocked upstream.

## 2026-06-13

- Made the 80-character learner-name limit truncate by Unicode code points so
  non-BMP characters are never split into lone surrogates.
- Added VM-harness regression coverage for prompted welcome names and prompted
  example choices while preserving clipboard opt-in behavior.
- Expanded learner-name terminal sanitization to remove all Unicode control
  and format characters, including C1 controls and zero-width formatting.

## 2026-06-12

- Migrated command modules and the launcher from archived oclif packages to
  `@oclif/core` 1.26.2, matching the Twilio CLI Core 8.3.4 host contract.
- Replaced `@oclif/dev-cli` with the maintained oclif utility CLI and removed
  unused legacy test, lint, coverage, and glob development dependencies.
- Added installed launcher and command smoke coverage for help, feedback, and a
  non-interactive examples path.
- Changed hosted validation from a production-only high-severity audit to a
  zero-finding audit of the full dependency graph.
- Made every Make target execute npm from the repository root so the full gate
  is independent of the caller's working directory.

## 2026-06-10

- Raised the maintained runtime contract from Node 10 to supported Node 22+
  and added an `.nvmrc` selecting Node 24 while leaving the oclif/Twilio
  dependency migration separately scoped.
- Retired the obsolete AppVeyor Node 10 configuration in favor of maintained
  GitHub-hosted validation.
- Added pinned, read-only hosted Linux and Windows validation on Node 22 and
  Node 24 for the dependency-free CLI training baseline.
- Documented deprecated oclif development-tool risk and kept its migration
  separately scoped after restoring reproducible package validation.
- Upgraded Twilio CLI Core and Inquirer, committed a reproducible lockfile, and
  reduced the production dependency audit to zero findings.
- Added locked installs, production auditing, and package dry runs to hosted CI.
- Made post-package manifest cleanup portable across hosted Linux and Windows.
- Made baseline file reads CRLF-neutral and kept Unix mode checks on Unix hosts.

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
- Replaced raw clipboard failure details with a stable terminal message and
  direct command coverage.
- Sanitized learner names before the welcome command echoes them to the
  terminal.
- Froze the fake placeholder example catalog to keep training commands stable.
- Added a static check that preserves the executable launcher mode on `bin/run`.
- Included packaged launcher files in the npm package file list.
