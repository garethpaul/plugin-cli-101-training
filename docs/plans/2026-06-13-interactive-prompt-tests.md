# Interactive Prompt Regression Tests

status: planned

## Context

Installed smoke tests cover non-interactive command flags, while unit tests
cover name formatting, catalog lookup, and clipboard failure redaction. The
remaining roadmap item is the no-flag interactive path: prompted learner names
and prompted example choices are not exercised directly.

## Priorities

1. Exercise both interactive prompt branches through the existing VM harnesses.
2. Verify prompted input reaches the reviewed formatter/catalog and clipboard
   remains opt-in.
3. Keep production command code, examples, dependencies, packaging, and live
   Twilio behavior unchanged.

## Requirements

- R1. Allow the welcome test loader to inject an Inquirer response.
- R2. Run the welcome command and assert a control-containing prompted name is
  sanitized in learner-facing output.
- R3. Allow the examples test loader to inject a prompted catalog choice.
- R4. Run the examples command without an `--example` flag and assert the
  prompted reviewed command is printed.
- R5. Assert the interactive example path does not write to the clipboard when
  `--copy` is absent.
- R6. Enforce tests, unchanged production sources, completed evidence, and
  documentation through the baseline checker.

## Verification Plan

- install the exact lock with `npm ci --ignore-scripts` on Node 22 and Node 24
- run focused welcome and example tests on Node 22 and Node 24
- `npm test`, `npm run lint`, `npm run build`, and all Make gates on both Node
  versions
- `npm audit --audit-level=low`
- run the checker from an external working directory
- parse package/lock/workflow JSON or YAML and README SVG
- run focused hostile mutations against both prompt injections, prompted
  output, clipboard opt-in, unchanged production sources, docs, and evidence
- `git diff --check`
- scan intended paths for secrets, real phone numbers, generated artifacts, and
  dependency drift

## Scope Boundaries

- Do not change production command modules, example catalog values, clipboard
  behavior, dependencies, lockfile, package metadata, launchers, or workflow.
- Do not run live Twilio authentication, API calls, package publication, or
  account mutations.
- Do not regenerate README command output or oclif manifests.
