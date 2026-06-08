## Plugin CLI 101 Training Vision

Plugin CLI 101 Training is an oclif-based Twilio CLI plugin for teaching basic
Twilio CLI workflows, examples, plugin usage, and feedback paths.

The repository is useful as a workshop companion: it gives learners concrete
commands to run, prompts them through example choices, and keeps common setup
links in one place.

The goal is to keep the plugin small, teachable, and safe for learners who are
copying commands into their own Twilio environments.

Current baseline: `npm run check` verifies the training command guardrails,
fake placeholder examples, package scripts, and docs without requiring Twilio
credentials or a live account.

The current focus is:

Priority:

- Preserve the `cli-101-training` command namespace
- Keep workshop examples easy to read and copy
- Avoid embedding real phone numbers, account identifiers, or credentials
- Keep phone-number workflows read-only unless side effects are explicit
- Keep clipboard writes opt-in after command review
- Maintain oclif packaging metadata for Twilio CLI plugin installation

Next priorities:

- Add tests for command prompts, flags, and clipboard output
- Document supported Node and Twilio CLI versions
- Remove unused imports and stale generated README sections
- Revisit lint and audit scripts once a lockfile and dependency baseline are
  committed

Contribution rules:

- One PR = one focused command, example, packaging, or documentation change.
- Do not commit real Twilio credentials or customer data.
- Keep command examples explicit about the environment they affect.
- Keep examples on fake placeholder values and no phone-number purchases.
- Keep clipboard copy behind an explicit flag.
- Keep `npm run check` passing when command behavior changes.
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
