## Plugin CLI 101 Training Vision

Plugin CLI 101 Training is an oclif-based Twilio CLI plugin for teaching basic
Twilio CLI workflows, examples, plugin usage, and feedback paths.

The repository is useful as a workshop companion: it gives learners concrete
commands to run, prompts them through example choices, and keeps common setup
links in one place.

The goal is to keep the plugin small, teachable, and safe for learners who are
copying commands into their own Twilio environments.

Current baseline: `npm run check`, `npm run lint`, `npm run build`, and
`npm test` verify the training command guardrails, fake placeholder examples,
package scripts, and docs without requiring Twilio credentials or a live
account. Package scripts call the repository-owned Node gate directly; Make
fails closed and is not a validation entrypoint.

The current focus is:

Priority:

- Keep the dependency-free baseline running on pinned hosted Linux and Windows
  with the exact Node 22.13 compatibility floor and maintained Node 24
- Keep the locked full dependency graph free of known audit findings

- Preserve the `cli-101-training` command namespace
- Keep workshop examples easy to read and copy
- Avoid embedding real phone numbers, account identifiers, or credentials
- Keep phone-number workflows read-only unless side effects are explicit
- Keep clipboard writes opt-in after command review
- Keep clipboard failure details out of learner-facing terminal output
- Keep learner names sanitized before terminal output
- Strip bidirectional formatting controls from learner names before display
- Strip all Unicode control and format characters from learner names before
  display
- Strip Unicode line and paragraph separators from learner names before
  terminal display
- Keep learner-name truncation grapheme-safe at the 80-character boundary
- Keep the frozen example catalog limited to reviewed fake placeholders
- Keep the `form-data 4.0.6` transitive advisory override until Twilio CLI Core
  absorbs the patched range
- Track the js-yaml upstream blocker without overriding the oclif core 1.x
  `safeDump` compatibility boundary or weakening the low-severity audit
- Keep frozen example choices derived from the reviewed catalog
- Keep unknown example keys from resolving to command output
- Keep interactive welcome and example prompt paths covered without live Twilio
  access or implicit clipboard writes
- Keep `bin/run` as the executable launcher for Unix installs
- Keep packaged launcher files included for npm publishes
- Keep `npm run lint` and `npm run build` available as stable static gate aliases
- Keep validation authority independent of caller-controlled Make variables,
  included makefiles, and replacement recipes
- Maintain oclif packaging metadata for Twilio CLI plugin installation
- Preserve the `@oclif/core` 1.x compatibility boundary required by Twilio CLI
  Core 8.3.4 until the host itself adopts a newer core contract

Next priorities:

- Remove unused imports and stale generated README sections
- Reassess the oclif core compatibility boundary when Twilio CLI Core changes
  its supported host major

Contribution rules:

- One PR = one focused command, example, packaging, or documentation change.
- Do not commit real Twilio credentials or customer data.
- Keep command examples explicit about the environment they affect.
- Keep examples on fake placeholder values and no phone-number purchases.
- Keep clipboard copy behind an explicit flag.
- Keep `npm run check`, `npm run lint`, `npm run build`, and `npm test` passing
  when command behavior changes.
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
