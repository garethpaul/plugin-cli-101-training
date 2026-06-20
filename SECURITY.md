# Security Policy

## Supported Versions

The supported security scope for `plugin-cli-101-training` is the current default branch, `main`. Older commits, tags, branches, forks, demos, and generated artifacts are not actively supported unless the repository explicitly marks them as maintained.

Project summary: Twilio CLI 101 Training

## Reporting a Vulnerability

Please report suspected vulnerabilities through GitHub's private vulnerability reporting or by opening a draft GitHub Security Advisory for `garethpaul/plugin-cli-101-training` when that option is available. If GitHub does not show a private reporting option for this repository, contact the repository owner through GitHub and avoid posting exploit details publicly until the issue can be assessed.

Do not open a public issue that includes exploit code, secrets, personal data, or detailed reproduction steps for an unpatched vulnerability.

## What to Include

Helpful reports include:

- the affected file, endpoint, permission, dependency, or workflow
- a concise impact statement explaining what an attacker could do
- reproduction steps using test data and accounts you control
- the branch, commit SHA, platform version, device, runtime, or dependency versions used
- logs, screenshots, or proof-of-concept snippets that demonstrate impact without exposing private data

## Project Security Posture

- This repository appears to be a Node.js or JavaScript project. The active security scope is the code and documentation on the default branch.
- Review found authentication, token, or session-related code paths; changes in those areas should receive security-focused review before merge.
- Review found external API integrations or credential-adjacent configuration; changes in those areas should receive security-focused review before merge.
- Review found network clients, sockets, web APIs, or service endpoints; changes in those areas should receive security-focused review before merge.
- Review found file, document, data, or media parsing flows; changes in those areas should receive security-focused review before merge.
- Training examples use fake placeholder values and should have no phone-number
  purchases, hidden account mutations, or real customer identifiers.
- Dependency manifests detected: package.json. Dependency updates should preserve lockfiles when present and avoid introducing packages without a clear maintenance reason.

## Service and API Notes

For web services, APIs, sockets, or scraping workflows, prioritize reports involving authentication bypass, authorization errors, injection, server-side request forgery, unsafe deserialization, credential leakage, data exposure, or denial-of-service conditions. Use test accounts and minimal proof-of-concept traffic only.

For Twilio CLI training content, also report examples that include real-looking
phone numbers, Account SIDs, Auth Tokens, webhook URLs, messaging service IDs,
or commands that buy/update resources without an explicit warning. Review
before running copied examples with live Twilio credentials.

Clipboard writes should remain opt-in through `--copy` so learners can review
example commands before changing their local clipboard.
Clipboard failure details should not be echoed because provider errors can
contain machine-specific paths or terminal control text.

The frozen example catalog should only contain reviewed fake placeholders.
Frozen example choices should stay derived from the reviewed example catalog so
prompt options do not drift at runtime.
Unknown example keys should fail before command text is printed or copied.

Learner names entered at prompts should be treated as display-only input and
sanitized before terminal output. Strip Unicode control and format characters,
including bidirectional formatting controls, so prompt input cannot visually
reorder console text or issue terminal control sequences. Strip Unicode line
and paragraph separators so display-only names cannot add terminal lines.
Apply the learner-name display limit by grapheme clusters so truncation cannot
split flags, combining sequences, or non-BMP characters at the terminal boundary.

Keep `bin/run` as the executable launcher and avoid permission churn in
packaging files, because broken launcher metadata can change how learners run
the training plugin.
Keep packaged launcher files included in `package.json` so published installs
match the reviewed local launcher behavior.

## Dependency and Supply Chain Security

Pinned, read-only hosted Linux and Windows validation uses the committed
lockfile with lifecycle scripts disabled, audits the full dependency graph, runs
the focused behavior tests, and validates package contents on the exact Node
22.13 compatibility floor and Node 24. It does not retain checkout credentials
or use Twilio credentials.

`@oclif/core` 1.26.2 preserves the host contract required by Twilio CLI Core
8.3.4 while replacing the archived `@oclif/command` and `@oclif/config`
packages. The maintained oclif utility CLI replaces `@oclif/dev-cli`; unused
legacy test, lint, coverage, and glob packages are removed. The reviewed full
production dependencies and the development dependency graph have zero known
vulnerabilities.
Reviewed root overrides resolve `form-data 4.0.6` and `js-yaml 4.2.0` while
retaining the direct Twilio and oclif host versions. The low-severity audit is
enforced by a fail-closed JSON policy that rejects any nonzero count or
vulnerable package entry. The launcher preloads js-yaml 4's safe-by-default
`load` and `dump` implementations under the legacy oclif alias names.

Dependency updates should come from trusted package managers and should keep lockfiles in sync when lockfiles exist. Do not commit credentials, private keys, tokens, generated secrets, or machine-local configuration. If a vulnerability depends on a compromised package, typosquatting risk, insecure transitive dependency, or unsafe build step, include the package name, affected version, and the path through which it is used.

Run `npm run check`, `npm run lint`, `npm run build`, `make lint`,
`make build`, and `make check` before changing command examples, package
scripts, or credential-adjacent Twilio CLI behavior.

## Safe Research Guidelines

Good-faith research is welcome when it stays within these boundaries:

- use only accounts, devices, data, and infrastructure that you own or have explicit permission to test
- avoid destructive actions, persistence, spam, phishing, social engineering, or denial-of-service testing
- minimize access to personal data and stop testing immediately if private data is exposed
- do not exfiltrate secrets or third-party data; report the minimum evidence needed to verify impact
- keep vulnerability details confidential until the maintainer has assessed the report

## Maintainer Response

The maintainer will review complete reports as availability allows, prioritize issues by exploitability and impact, and coordinate a fix or mitigation when the affected code is still maintained. For sample, archived, or educational repositories, the likely remediation may be documentation, dependency updates, or clearly marking unsupported code rather than a production-style patch release.
