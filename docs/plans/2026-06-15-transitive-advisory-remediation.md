# Transitive Advisory Remediation

status: blocked_upstream

## Context

The exact lock now fails the production audit after new registry advisories:
`form-data@4.0.5` is affected by GHSA-hmw2-7cc7-3qxx and `js-yaml@3.14.2`
is affected by GHSA-h67p-54hq-rp68. The first arrives through
`@twilio/cli-core -> axios`; the second arrives through oclif core packages.
The audit's automatic full fix proposes an incompatible direct oclif major
upgrade.

## Requirements

- Resolve the high-severity `form-data` advisory without changing direct Twilio
  or oclif host contracts.
- Investigate the moderate `js-yaml` advisory and preserve the host contract if
  no compatible patched release exists.
- Keep the exact lock reproducible and require the override contract in the
  static checker.
- Prove the full Node 22 command, prompt, launcher, package, and audit gates
  still pass.
- Add completed evidence and dependency-risk guidance.

## Approach

- Use an npm root override for vulnerable `form-data` because its direct parent
  does not yet constrain the patched release into the current lock.
- Regenerate only `package-lock.json`, reinstall from that lock, and inspect
  the resolved dependency paths.
- Reject the change if installed oclif command smoke tests or package dry runs
  expose an incompatibility.

## Scope Boundaries

- Do not upgrade `@oclif/core`, `@twilio/cli-core`, command APIs, prompts,
  examples, clipboard behavior, or runtime output.
- Do not use `npm audit fix --force`. Keep a full-graph low-threshold audit and
  fail closed unless its JSON matches the exact reviewed upstream blocker.

## Verification

- Run exact-lock installation, `npm audit --audit-level=low`, all package and
  Make gates, external-directory validation, and `npm pack --dry-run` on Node
  22.
- Reject override removal, vulnerable-version restoration, weakened audit,
  missing guidance, and reopened-plan mutations.
- Audit the exact manifest/lock diff, generated artifacts, credentials,
  conflicts, modes, binaries, and large files.

## Risks

- `js-yaml` crosses a major version relative to legacy oclif declarations;
  full installed launcher and command tests are required before acceptance.
- This remediation is validation-blocking follow-up work on the same stacked PR
  as the Unicode separator fix discovered immediately before the audit failure.

## Work Completed

- Added an exact root override for `form-data 4.0.6` while preserving direct
  Twilio and oclif dependency versions.
- Confirmed that official oclif core 1.x requires `js-yaml 3.14.2` and calls
  `safeDump`, which throws under js-yaml 4; no patched 3.x backport or newer
  compatible Twilio CLI Core release exists.
- Regenerated the exact lock and required the patched form-data plus compatible
  nested js-yaml versions in the static baseline.
- Updated dependency-risk guidance and completed-plan contracts.
- Added a cross-platform audit-policy gate that accepts only the exact five
  moderate records tied to GHSA-h67p-54hq-rp68 and rejects any changed package,
  count, severity, advisory, malformed output, or high/critical finding.

## Verification Completed

- `npm ci --ignore-scripts` reproduced the 496-package graph from the lock.
- `npm audit --audit-level=low` confirms the high form-data finding is closed
  and reports five moderate js-yaml findings that remain blocked upstream.
- `node scripts/check-audit.js` passed against that exact JSON report, and its
  focused test rejected new-high, changed-advisory, additional inherited
  advisory, and missing-package reports.
- Installed-path verification retained form-data 4.0.6 and js-yaml 3.14.2;
  directly invoking the host's `safeDump` call against js-yaml 4 reproduced the
  removed-API failure.
- `npm test` and `make check` passed on Node 22, including installed oclif
  launcher and command smoke tests.
- The complete gate passed from an external working directory through the
  absolute Makefile path, and `npm pack --dry-run` preserved reviewed contents.
- Ten isolated hostile mutations were rejected across override removal,
  vulnerable lock restoration, workflow bypass, broadened severity acceptance,
  advisory replacement, focused-test removal, missing guidance, and a falsely
  completed plan status.
- Hosted run 27578645505 exposed that the raw low-threshold audit stopped both
  Ubuntu jobs before tests; the strict policy gate preserves the same full
  graph and threshold while allowing only the documented upstream blocker.
- Exact-head push run 27578803689 and pull-request run 27578804977 passed both
  Ubuntu jobs but exposed `spawnSync npm.cmd EINVAL` before policy evaluation
  on Windows with Node 22 and 24. The audit runner now uses shell dispatch only
  for the fixed Windows `npm.cmd audit --audit-level=low --json` invocation;
  focused tests and the static contract require that platform boundary without
  changing the accepted report.
- On Node 22.22.2 and 24.16.0, the focused audit-policy test, complete package
  gate, and live strict audit passed after the dispatch correction. The
  external-directory `make check` and `npm pack --dry-run --ignore-scripts`
  also passed on Node 22. Isolated runtime and static mutations that replaced
  the Windows guard with unconditional direct spawning were both rejected.
- `git diff --check` plus exact manifest and lock audits passed; secret and generated-artifact audits passed.

## Upstream Blocker

- `@twilio/cli-core@8.3.4` is the latest release and still depends on oclif core
  1.x packages.
- The latest oclif core 1.x release depends on js-yaml 3.x and invokes
  `safeDump`; js-yaml 4.2.0 replaces that API with a throwing compatibility
  stub.
- No js-yaml 3.x patched release exists. The full low-severity audit remains
  enabled through a strict JSON policy gate until the Twilio/oclif host line
  migrates or publishes a compatible fix.
