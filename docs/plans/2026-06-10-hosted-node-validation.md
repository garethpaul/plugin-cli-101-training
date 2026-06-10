# Hosted Node Validation

status: completed

## Context

The CLI training plugin has a dependency-free static and focused behavioral
test suite, but no hosted validation. Its legacy oclif/Twilio dependencies are
unlocked, so installing them would make the gate less reproducible.

## Priorities

1. Run `npm test` for pushes and pull requests.
2. Verify the maintained surface on Node 18 and Node 22.
3. Pin actions, runner, permissions, timeout, and concurrency.
4. Keep dependency installation and Twilio credentials out of CI.
5. Enforce the workflow contract from the static checker.

## Implementation Units

Add a commit-pinned, read-only hosted Linux matrix that runs `npm test` without
`npm install`. Preserve launcher modes, package files, example immutability,
unknown-key handling, and learner-name sanitization checks.

## Verification

- `npm run check`
- `npm test`
- `make lint`
- `make build`
- `make check`
- workflow YAML parse
- `git diff --check`
- successful hosted Linux `Check` workflow for Node 18 and Node 22

## Boundaries

- Do not install or update the unlocked dependency graph.
- Do not use Twilio credentials or make API calls.
- Do not change CLI behavior in this pass.
