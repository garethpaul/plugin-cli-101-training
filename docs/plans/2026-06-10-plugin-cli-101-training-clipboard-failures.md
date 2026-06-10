# Clipboard Failure Redaction

status: completed

## Context

The opt-in clipboard path printed `error.message` when `clipboardy` failed.
Provider errors can contain machine-specific paths or terminal control text,
and JavaScript also permits throwing values that are not `Error` objects.

## Objectives

- Keep clipboard writes opt-in through `--copy`.
- Replace raw clipboard failure details with a stable unavailable message.
- Verify sensitive thrown details do not reach command output.
- Cover the `clipboard unavailable` output in `test_examples_catalog.js`.
- Keep successful example printing and clipboard behavior unchanged.

## Verification

- `npm test`
- `npm run lint`
- `npm run build`
- `make check`
- Mutation: restore raw `error.message` output and confirm the command test
  fails.
- `git diff --check`
