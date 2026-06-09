# Plugin CLI 101 Training Check Wrapper

status: completed

## Context

The training plugin already exposes `npm test` as the static verification gate,
but repository automation expects a root `make check` command.

## Goals

- Add a root Makefile with `test`, `verify`, and `check` targets.
- Make `make check` run the same static baseline as `npm test`.
- Keep the gate dependency-light and safe for training examples.
- Document and preserve the wrapper through README, CHANGES, and the baseline.

## Verification

- `make check`
- `npm test`
- `git diff --check`
