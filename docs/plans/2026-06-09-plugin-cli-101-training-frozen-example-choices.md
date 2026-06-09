# Frozen Example Choices Plan

status: completed

## Context

The example command catalog was frozen, but the derived `EXAMPLE_CHOICES` array
remained mutable. Prompt options should stay aligned with the reviewed fake
placeholder catalog throughout command execution.

## Objectives

- Freeze `EXAMPLE_CHOICES` with `Object.freeze` after deriving it from
  `EXAMPLE_COMMANDS`.
- Preserve the existing example command output and prompt behavior.
- Extend static baseline checks and docs for immutable prompt choices.

## Verification

- `npm run check`
- `npm test`
- `make check`
- `git diff --check`
