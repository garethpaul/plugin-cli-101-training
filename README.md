# plugin-cli-101-training

Repository maintenance and static verification require Node 22.13 or newer;
`.nvmrc` selects Node 24. Node 22.13 is the first Node 22 release that loads the
ESM-only Octokit dependency used by the Twilio/oclif host without an opt-in flag
or an experimental warning. The plugin uses `@oclif/core` 1.26.2 because Twilio
CLI Core 8.3.4 supports the oclif core 1.x host contract; the maintained oclif
utility CLI handles package metadata generation.

<!-- README-OVERVIEW-IMAGE -->
![Project overview](docs/readme-overview.svg)

## Overview

`garethpaul/plugin-cli-101-training` is an oclif-based Twilio CLI training
plugin. It provides welcome text, feedback links, printable example commands,
and opt-in clipboard copy for CLI 101 workshops.

Examples use fake placeholder phone numbers and URLs. Review before running any
command in a live Twilio account; training examples should have no phone-number
purchases or hidden account mutations.

This README is based on the checked-in source, manifests, scripts, and repository metadata on the `main` branch. The project language mix found during review was: JavaScript (3).

## Repository Contents

- `.gitignore` - generated output, dependency, log, and environment ignores
- `CHANGES.md` - baseline change log
- `Makefile` - fail-closed redirect to package-script validation
- `README.md` - project overview and local usage notes
- `package.json` - JavaScript dependency and script metadata
- `bin` - source or example code
- `SECURITY.md` - security reporting and disclosure guidance
- `src` - source or example code
- `VISION.md` - project direction and maintenance guardrails
- `docs/plans/2026-06-08-plugin-cli-101-training-baseline.md` - completed baseline plan
- `scripts/check-baseline.js` - dependency-free static baseline checks

Additional scan context:

- Source directories: bin, src
- Dependency and build manifests: package.json
- Entry points or build surfaces: package.json, Makefile
- Behavior tests: `test_examples_catalog.js`, `test_welcome_name_format.js`,
  the installed launcher smoke suite `test_oclif_commands.js`, and repository
  gate attack coverage in `test_repository_gate.js`
- The VM harnesses execute the interactive welcome and example prompt paths,
  including sanitized prompted names and clipboard opt-in behavior.

## Getting Started

### Prerequisites

- Git
- Node.js 22 or newer and npm; Node 24 is the repository default

### Setup

```bash
git clone https://github.com/garethpaul/plugin-cli-101-training.git
cd plugin-cli-101-training
npm ci --ignore-scripts
```

Use `npm ci --ignore-scripts` with the reviewed lockfile for reproducible
contributor and CI installs.
The dependency-free focused tests can run before installation, while full
launcher and package validation use the committed lockfile. The reviewed full
dependency graph has zero known audit findings. Root overrides keep the current
Twilio/oclif host contract while resolving `form-data 4.0.6` and
`js-yaml 4.2.0`. Installed launcher and command smoke tests guard the legacy
host boundary after the transitive parser update. The packaged launcher
preloads compatibility aliases for the legacy oclif `safeLoad` and `safeDump`
calls before loading oclif core.

## Running or Using the Project

- Run `npm run check`, `npm run lint`, or `npm run build` before changing
  commands or examples.
- Use `./bin/run cli-101-training:welcome` to launch the welcome command after
  dependencies are installed.
- Use `./bin/run cli-101-training:examples --example sms` to print a specific
  example command.
- Add `--copy` only after reviewing the command and deciding to place it on the
  local clipboard.
- The frozen example catalog keeps fake placeholder training commands stable at
  runtime.
- Frozen example choices keep prompt options aligned with the reviewed catalog.
- Unknown example keys fail before any command text is printed or copied.
- The welcome command trims learner names, strips all Unicode control and
  format characters (including bidirectional formatting controls) plus Unicode
  line and paragraph separators, and caps displayed names at 80 grapheme clusters without splitting flags,
  combining sequences, or non-BMP characters.
- Keep `bin/run` as the executable launcher for Unix installs; `bin/run.cmd`
  remains the non-executable Windows wrapper.
- Packaged launcher files stay included through the package `files` list.

Detected npm scripts:

- `npm run build` - `node scripts/repository-gate.js build`
- `npm run postpack` - portable Node cleanup for `oclif.manifest.json`
- `npm run prepack` - `oclif manifest && oclif readme`
- `npm run check` - `node scripts/repository-gate.js check`
- `npm run lint` - `node scripts/repository-gate.js lint`
- `npm run test` - static, focused behavior, and installed command smoke tests
- `npm run version` - `oclif readme && git add README.md`

## Testing and Verification

Pinned hosted Linux and Windows validation performs a locked, script-disabled
install, audits the full dependency graph, runs `npm test`, and validates package
contents on the exact Node 22.13 compatibility floor and Node 24 without retaining
checkout credentials.

- `npm run check`
- `npm run lint`
- `npm run build`
- `npm test`
- `node scripts/check-baseline.js`
- `node scripts/repository-gate.js check`
- `node test_welcome_name_format.js`
- `node test_examples_catalog.js`
- `node test_oclif_commands.js`
- `node test_repository_gate.js`

Package scripts invoke the repository-owned Node gate directly so hosted Linux
and Windows validation do not depend on Make variable or shell precedence.
Make is explicitly not a trusted validation entrypoint: every Make invocation
fails during parsing before recipes or shell functions can claim validation.

When the required SDK or runtime is unavailable, use static checks and source review first, then verify on a machine that has the matching platform toolchain.

## Configuration and Secrets

- Detected references to Twilio. Keep API keys, OAuth credentials, tokens, and account-specific values in local configuration only.
- Do not commit real Twilio credentials, Account SIDs, Auth Tokens, customer
  phone numbers, messaging service IDs, webhook URLs, or workshop attendee
  data.

## Security and Privacy Notes

- Review changes touching authentication or token handling; examples from the scan include src/commands/cli-101-training/welcome.js.
- Review changes touching external API calls or credential-adjacent configuration; examples from the scan include bin/run, package.json, src/commands/cli-101-training/examples.js, src/commands/cli-101-training/feedback.js, and 1 more.
- Review changes touching network requests, sockets, or service endpoints;
  relevant files include `package.json` and the Twilio training commands.
- Review changes touching file or data parsing; relevant files include
  `.github/workflows/check.yml`, `package.json`, and the training commands.
- Training commands can affect live accounts when copied with real credentials.
  Keep side effects visible, use fake placeholder values, and prefer read-only
  examples for phone-number workflows.
- Clipboard writes are opt-in through `--copy`; the default examples command
  prints without changing the local clipboard.
- Clipboard failure details are not echoed; unavailable clipboard services use
  a stable learner-facing message.
- The frozen example catalog should stay limited to reviewed fake placeholders.
- Frozen example choices should stay derived from the reviewed catalog.
- Learner names entered at the welcome prompt should stay display-only and
  sanitized before terminal output, including bidirectional formatting controls
- Prompted example choices must resolve through the frozen catalog and must not
  write to the clipboard unless `--copy` is present.
  that could visually reorder console text.

## Maintenance Notes

- Run `npm run check`, `npm run lint`, `npm run build`, and `npm test` before
  changing examples, command prompts, package scripts, or Twilio credential
  handling.
- Keep the executable launcher mode on `bin/run` intact when editing packaging
  files.
- Keep packaged launcher files included when editing `package.json`.
- Keep `npm pack --dry-run` and the `@oclif/core` command smoke tests passing on
  the exact Node 22.13 compatibility floor and Node 24.
- See `CHANGES.md` and
  `docs/plans/` for the current safe-training baseline.
- See `SECURITY.md` for vulnerability reporting and safe research guidance.
- See `VISION.md` for project direction and contribution guardrails.

## Contributing

Keep changes small and tied to the project that is already present in this repository. For code changes, document the toolchain used, avoid committing generated dependency directories or local configuration, and update this README when setup or verification steps change.
