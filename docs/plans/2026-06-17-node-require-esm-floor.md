# Node require(esm) Compatibility Floor

status: completed

## Context

The package declared `node >=22.0.0`, while the installed Twilio/oclif command
path loads ESM-only Octokit code through CommonJS. A clean locked install on Node
22.11.0 reproduced `ERR_REQUIRE_ESM` during the installed command smoke test.
The same test passed on the floating hosted Node 22 lane because setup-node
resolved a newer patch release.

Node's official CommonJS documentation records that `require(esm)` stopped
requiring `--experimental-require-module` in Node 22.12.0 and stopped emitting an
experimental warning by default in Node 22.13.0.

## Requirements

- Declare Node 22.13.0 as the minimum supported runtime.
- Test the exact Node 22.13.0 floor on hosted Linux and Windows instead of a
  floating Node 22 selector.
- Preserve the existing Node 24 lane, dependency graph, commands, output, and
  strict audit policy.
- Keep package metadata, lock metadata, current guidance, and static contracts
  synchronized.

## Approach

- Add a static regression contract for the exact engine floor and CI matrix.
- Update only root package metadata and guidance; do not change dependency
  versions or runtime command implementation.
- Validate a fresh script-disabled lock install, `npm test`, the strict audit,
  Make aliases, and `npm pack --dry-run` on the supported floor.

## Scope Boundaries

- Do not add `NODE_OPTIONS`, suppress warnings, or weaken the command smoke test.
- Do not modify Twilio, oclif, Octokit, form-data, or js-yaml dependency versions.
- Do not claim Node 22.0 through 22.12 support.

## Verification

- Reproduce the original Node 22.11.0 failure from a clean exported tree.
- Run the complete local gate on Node 22.13.0 or newer supported Node 22, plus
  the repository's default Node 24 maintenance runtime when available.
- Require exact-head hosted success on Node 22.13.0 and Node 24 across Ubuntu and
  Windows.
- Run `git diff --check` and scan for generated artifacts and secrets.

## Work Completed

- Raised the root package and lockfile engine contract from Node 22.0.0 to Node
  22.13.0.
- Replaced the floating hosted Node 22 selector with exact Node 22.13.0 coverage
  on Ubuntu and Windows while preserving the Node 24 lane.
- Extended the dependency-free baseline to reject a weakened engine floor,
  divergent lock metadata, or a floating Node 22 workflow selector.
- Updated current repository, security, maintenance, and agent guidance without
  rewriting historical completed plans.

## Verification Completed

- Reproduced `ERR_REQUIRE_ESM` on Node 22.11.0 from a fresh locked install.
- Confirmed the official Node 22.13.0 Linux archive against the published
  SHA-256 checksum before using it for floor validation.
- Installed the exact 496-package lock with lifecycle scripts disabled on Node
  22.13.0.
- Passed the focused audit-policy, learner-name, example-catalog, and installed
  Oclif command smoke tests on Node 22.13.0.
- Passed the live strict audit against the exact reviewed upstream js-yaml
  blocker and retained zero high or critical findings.
- Passed `npm pack --dry-run`; the package retained the reviewed eight-file
  contents and removed its generated manifest afterward.
- The complete `npm test`, Make aliases, and repository scans passed locally.
- Exact-head push run 27664317402 and pull-request run 27664325793 passed all
  eight Ubuntu and Windows jobs on Node 22.13.0 and Node 24 at commit
  `04fd7d40f252549683b1e41516ad99e6125438b3`.
