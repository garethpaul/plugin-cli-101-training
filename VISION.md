## Plugin CLI 101 Training Vision

Plugin CLI 101 Training is an oclif-based Twilio CLI plugin for teaching basic
Twilio CLI workflows, examples, plugin usage, and feedback paths.

The repository is useful as a workshop companion: it gives learners concrete
commands to run, prompts them through example choices, and keeps common setup
links in one place.

The goal is to keep the plugin small, teachable, and safe for learners who are
copying commands into their own Twilio environments.

Current baseline: `npm run check`, `npm run lint`, `npm run build`, and
`make check` verify the training command guardrails, fake placeholder examples,
package scripts, and docs without requiring Twilio credentials or a live
account.

The current focus is:

Priority:

- Keep the dependency-free baseline running on pinned hosted Linux and Windows
  with maintained Node 22 and Node 24
- Keep the locked full dependency graph free of known audit findings

- Preserve the `cli-101-training` command namespace
- Keep workshop examples easy to read and copy
- Avoid embedding real phone numbers, account identifiers, or credentials
- Keep phone-number workflows read-only unless side effects are explicit
- Keep clipboard writes opt-in after command review
- Keep clipboard failure details out of learner-facing terminal output
- Keep learner names sanitized before terminal output
- Strip bidirectional formatting controls from learner names before display
- Keep the frozen example catalog limited to reviewed fake placeholders
- Keep frozen example choices derived from the reviewed catalog
- Keep unknown example keys from resolving to command output
- Keep `bin/run` as the executable launcher for Unix installs
- Keep packaged launcher files included for npm publishes
- Keep `make lint`, `make build`, `npm run lint`, and `npm run build` available
  as stable static gate aliases
- Maintain oclif packaging metadata for Twilio CLI plugin installation
- Preserve the `@oclif/core` 1.x compatibility boundary required by Twilio CLI
  Core 8.3.4 until the host itself adopts a newer core contract

Next priorities:

- Add tests for the remaining interactive command prompt paths
- Remove unused imports and stale generated README sections
- Reassess the oclif core compatibility boundary when Twilio CLI Core changes
  its supported host major

Contribution rules:

- One PR = one focused command, example, packaging, or documentation change.
- Do not commit real Twilio credentials or customer data.
- Keep command examples explicit about the environment they affect.
- Keep examples on fake placeholder values and no phone-number purchases.
- Keep clipboard copy behind an explicit flag.
- Keep `npm run check`, `npm run lint`, `npm run build`, and `make check`
  passing when command behavior changes.
- Update README output when command behavior changes.

## Security And Responsible Use

Canonical security policy and reporting:

- [`SECURITY.md`](SECURITY.md)

Training plugins can trigger real account actions if examples are copied with
live credentials. Commands should make side effects obvious and should never
hide account, messaging, webhook, or phone-number changes.

## What We Will Not Merge (For Now)

- Real phone numbers or credentials in examples
- Hidden account mutations
- Broad plugin rewrites without workshop notes
- Generated README churn unrelated to command behavior

This list is a roadmap guardrail, not a permanent rule.
Strong user demand and strong technical rationale can change it.
