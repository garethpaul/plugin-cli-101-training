# Example Lookup Guard

status: completed

## Context

The examples command exposes a frozen catalog and frozen prompt choices, but
the command still read `EXAMPLE_COMMANDS[example]` directly. Oclif constrains
flag values, but direct or programmatic command paths should still fail
explicitly for unknown example keys before printing or copying command text.

## Objectives

- Add `getExampleCommand` to resolve reviewed catalog entries explicitly.
- Return `null` for unknown example keys.
- Fail the examples command before output or clipboard copy when an unknown
  key reaches the command.
- Add dependency-free catalog lookup tests and include them in `npm test`.

## Verification

- `node test_examples_catalog.js`
- `npm test`
- `npm run check`
- `make check`
- `git diff --check`
