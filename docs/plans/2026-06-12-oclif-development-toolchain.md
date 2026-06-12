# Modern oclif development toolchain

status: completed

## Goal

Remove the legacy oclif development graph that currently reports 19 audit
findings, including seven high-severity findings, without changing the three
training commands or claiming compatibility beyond the Twilio CLI host line
used by this plugin.

## Context

The production dependency audit is clean, but package maintenance still uses
the archived `@oclif/command`, `@oclif/config`, and `@oclif/dev-cli` generation
and testing era. Twilio CLI Core 8.3.4 depends on `@oclif/core` 1.x, so this pass
will use the latest compatible 1.x core rather than adopting oclif core 4 and
silently breaking plugin loading in the supported host. The maintained oclif
utility CLI replaces `oclif-dev` for manifest and README generation.

## Implementation Units

1. Add `test_oclif_commands.js` characterization coverage that loads every
   command, exercises flag parsing and safe non-interactive command paths, and
   invokes the packaged launcher for help or version output without Twilio
   credentials or network access.
2. Replace `@oclif/command` and `@oclif/config` with the compatible
   `@oclif/core` 1.x API in the command modules and launcher, including async
   flag parsing, core flush/error handling, and the existing Twilio
   environment setup.
3. Replace `@oclif/dev-cli` with the maintained `oclif` utility CLI and remove
   unused legacy test, lint, coverage, and glob packages that are not part of
   the repository's actual verification path.
4. Regenerate the lockfile, preserve package contents and executable modes,
   and update the baseline checker so archived imports, vulnerable direct
   development packages, missing smoke tests, dependency drift, and incomplete
   plan status fail closed. Keep the Make wrapper independent of the caller's
   working directory for external gate execution.
5. Update maintenance, security, and compatibility documentation with the
   supported Twilio/oclif boundary and the actual final audit and hosted
   verification evidence.

## Verification

- Run `npm ci --ignore-scripts` from the reviewed lockfile.
- Run `npm audit` for the complete production and development graph and require
  zero known vulnerabilities.
- Run `npm run check`, `npm test`, `make lint`, `make build`, and `make check`.
- Generate the oclif manifest and README through package lifecycle validation,
  run `npm pack --dry-run`, and inspect the packaged launchers and command
  sources.
- Run the full gate from an external working directory.
- Execute hostile mutations for archived imports, core-major drift, re-added
  vulnerable development tools, disabled command smoke coverage, launcher
  regressions, and weakened audit policy.
- Require the canonical Linux and Windows Node 22 and Node 24 push and
  `pull_request` jobs to succeed on the exact pushed head.

## Boundaries

- Keep the package CommonJS and preserve the existing command IDs, prompts,
  output, clipboard opt-in behavior, examples, and Twilio CLI Core 8.3.4 host
  integration.
- Do not add Twilio credentials, make live API calls, publish the package, or
  migrate the host contract to oclif core 4 in this unit.
- Do not retain an obsolete tool merely to make its old generated output
  byte-identical; generated README changes must instead be reviewed for
  command and option fidelity.

## Assumptions

- The oclif utility CLI's documented core compatibility matrix remains valid
  for generating metadata for a CommonJS `@oclif/core` 1.x plugin.
- The repository's custom Node tests are the intended behavioral suite; the
  listed Mocha, Chai, nyc, oclif-test, Twilio cli-test, ESLint, and globby
  packages are unused until proven otherwise by implementation-time tracing.

## Completion Evidence

- Node 22.22.2 and Node 24.16.0 passed the learner-name, example-catalog, and
  installed `test_oclif_commands.js` launcher suites.
- `npm audit --audit-level=low` reported zero vulnerabilities across the full
  495-package production and development graph.
- `oclif manifest`, `oclif readme`, and `npm pack --dry-run` completed; the
  package contained the manifest, both launchers, README, package metadata, and
  all three command modules.
- Repository-local and external-working-directory `make check` gates passed;
  the external invocation also exposed and fixed a pre-existing Makefile
  caller-directory dependency.
- Eight hostile mutations covering archived command and launcher imports,
  oclif core-major drift, a restored vulnerable direct development package,
  omitted command smoke coverage, production-only auditing, and a nonportable
  Make wrapper were rejected by the baseline checker, including an audit-policy
  spoof that retained the approved command only in a workflow comment.
