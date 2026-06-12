# Hosted Node Validation

status: completed

## Context

The CLI training plugin has a dependency-free static and focused behavioral
test suite, but no hosted validation. A reviewed lockfile now makes full
installation and package validation reproducible while lifecycle scripts stay
disabled during dependency installation.

## Priorities

1. Run `npm test` for pushes and pull requests.
2. Verify the maintained surface on Node 22 and Node 24.
3. Pin actions, runner, permissions, timeout, and concurrency.
4. Install from the lockfile with lifecycle scripts disabled and audit the
   production graph.
5. Keep Twilio credentials out of CI.
6. Enforce the workflow contract from the static checker.

## Implementation Units

Add a commit-pinned, read-only hosted Linux and Windows matrix that runs a
locked, script-disabled install, production audit, `npm test`, and package dry
run. Preserve launcher modes, package files, example immutability, unknown-key
handling, and learner-name sanitization checks.
Use Node-based post-package cleanup so package validation behaves the same on
Linux and Windows shells.

## Verification

- `npm run check`
- `npm test`
- `make lint`
- `make build`
- `make check`
- workflow YAML parse
- `git diff --check`
- successful hosted Linux and Windows `Check` workflow for Node 22 and Node 24

## Boundaries

- Install only from the reviewed lockfile and keep lifecycle scripts disabled
  during dependency installation.
- Do not use Twilio credentials or make API calls.
- Do not change CLI behavior in this pass.
