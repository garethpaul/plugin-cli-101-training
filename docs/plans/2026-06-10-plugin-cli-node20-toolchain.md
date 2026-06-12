# Supported Plugin CLI Node toolchain

status: completed

## Goal

Move repository maintenance and static verification off end-of-life Node
runtimes while keeping the older oclif/Twilio dependency migration separately
scoped. The initial Node 20 draft was updated before commit because Node 20
reached end of life on March 24, 2026.

## Changes

- Require maintained Node 22 or newer in package metadata.
- Add `.nvmrc` selecting active-LTS Node 24.
- Replace the AppVeyor Node 10 path with GitHub-hosted Node 22 and Node 24
  validation on Linux and Windows.
- Preserve dependency-free training command checks.

## Verification

Run `make check` on Node 22 and Node 24, parse the hosted workflow, execute
hostile baseline mutations, and run `git diff --check`.
