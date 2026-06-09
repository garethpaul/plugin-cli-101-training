# Frozen Example Catalog Plan

status: completed

## Context

The training command catalog is static placeholder content, but the exported
object was mutable at runtime.

## Objectives

- Wrap `EXAMPLE_COMMANDS` in `Object.freeze`.
- Keep the catalog limited to reviewed fake placeholder commands.
- Extend the static baseline and docs for the frozen example catalog.

## Verification

- `npm run check`
- `npm test`
- `make check`
- `git diff --check`
