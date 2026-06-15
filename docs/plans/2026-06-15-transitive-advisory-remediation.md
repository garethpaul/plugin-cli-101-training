# Transitive Advisory Remediation

status: in_progress

## Context

The exact lock now fails the production audit after new registry advisories:
`form-data@4.0.5` is affected by GHSA-hmw2-7cc7-3qxx and `js-yaml@3.14.2`
is affected by GHSA-h67p-54hq-rp68. The first arrives through
`@twilio/cli-core -> axios`; the second arrives through oclif core packages.
The audit's automatic full fix proposes an incompatible direct oclif major
upgrade.

## Requirements

- Resolve the transitive graph to patched `form-data` and `js-yaml` releases
  without changing direct Twilio or oclif host contracts.
- Keep the exact lock reproducible and require the override contract in the
  static checker.
- Prove the full Node 22 command, prompt, launcher, package, and audit gates
  still pass.
- Add completed evidence and dependency-risk guidance.

## Approach

- Use npm root overrides for the two vulnerable transitive packages because
  their direct parents do not yet constrain patched versions into the current
  lock.
- Regenerate only `package-lock.json`, reinstall from that lock, and inspect
  the resolved dependency paths.
- Reject the change if installed oclif command smoke tests or package dry runs
  expose an incompatibility.

## Scope Boundaries

- Do not upgrade `@oclif/core`, `@twilio/cli-core`, command APIs, prompts,
  examples, clipboard behavior, or runtime output.
- Do not use `npm audit fix --force` or weaken the zero-finding audit.

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
