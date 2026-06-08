## Plugin CLI 101 Training Vision

Plugin CLI 101 Training is an oclif-based Twilio CLI plugin for teaching basic
Twilio CLI workflows, examples, plugin usage, and feedback paths.

The repository is useful as a workshop companion: it gives learners concrete
commands to run, prompts them through example choices, and keeps common setup
links in one place.

The goal is to keep the plugin small, teachable, and safe for learners who are
copying commands into their own Twilio environments.

The current focus is:

Priority:

- Preserve the `cli-101-training` command namespace
- Keep workshop examples easy to read and copy
- Avoid embedding real phone numbers, account identifiers, or credentials
- Maintain oclif packaging metadata for Twilio CLI plugin installation

Next priorities:

- Replace placeholder values with clearly fake and documented examples
- Add tests for command prompts, flags, and clipboard output
- Document supported Node and Twilio CLI versions
- Remove unused imports and stale generated README sections

Contribution rules:

- One PR = one focused command, example, packaging, or documentation change.
- Do not commit real Twilio credentials or customer data.
- Keep command examples explicit about the environment they affect.
- Update README output when command behavior changes.

## Security And Responsible Use

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
