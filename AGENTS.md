# AGENTS.md

## Repository purpose

`garethpaul/plugin-cli-101-training` is an oclif-based Twilio CLI training plugin. It provides welcome text, feedback links, printable example commands, and opt-in clipboard copy for CLI 101 workshops.

## Project structure

- `Makefile` - fail-closed redirect to package-script validation
- `scripts` - baseline checks and helper scripts
- `docs` - plans, notes, and generated README assets
- `src` - primary source code
- `package.json` - Node package metadata and scripts

## Development commands

- Install dependencies: `npm ci --ignore-scripts`
- Full baseline: `npm test`
- Static checks: `npm run check`
- Lint/static alias: `npm run lint`
- Build/static alias: `npm run build`
- package script `build`: `npm run build`
- package script `lint`: `npm run lint`
- package script `test`: `npm test`
- package script `check`: `npm run check`
- If a command above skips because a platform toolchain is missing, verify on a machine with that SDK before claiming platform behavior is tested.

## Coding conventions

- Language mix noted in the README: JavaScript (3).
- Use Node >=22.13.0 for package scripts; `.nvmrc` selects Node 24 for local maintenance.

## Testing guidance

- Test-related files detected: `test_examples_catalog.js`, `test_welcome_name_format.js`
- Start with the narrowest relevant test, then run `npm test` before handing off if the change is not documentation-only.
- Keep README verification notes in sync when commands, fixtures, or supported toolchains change.

## PR / change guidance

- Keep diffs focused on the requested repository and avoid unrelated modernization or formatting churn.
- Preserve public APIs, sample behavior, file formats, and documented environment variables unless the task explicitly changes them.
- Update tests, README notes, or docs/plans when behavior, security posture, or validation commands change.
- Call out skipped platform validation, legacy toolchain assumptions, and any risky files touched in the final summary.

## Safety and gotchas

- Detected references to Twilio. Keep API keys, OAuth credentials, tokens, and account-specific values in local configuration only.
- Do not commit real Twilio credentials, Account SIDs, Auth Tokens, customer phone numbers, messaging service IDs, webhook URLs, or workshop attendee data.
- Training commands can affect live accounts when copied with real credentials. Keep side effects visible, use fake placeholder values, and prefer read-only examples for phone-number workflows.
- Clipboard writes are opt-in through `--copy`; the default examples command prints without changing the local clipboard.
- Remove Unicode control and format characters before displaying learner names.
- Keep the 80-character learner-name limit grapheme-safe for flags, combining
  sequences, and non-BMP characters.
- The frozen example catalog should stay limited to reviewed fake placeholders.
- Frozen example choices should stay derived from the reviewed catalog.
- Keep the dependency-free baseline tests runnable before installation, and use the committed lockfile for full install, audit, launcher, and package validation.
- Keep production dependency audits at zero high or critical findings; do not hide findings with audit overrides.
- Do not reintroduce AppVeyor or another CI path on an end-of-life Node release.

## Agent workflow

1. Inspect the README, Makefile, manifests, and the files directly related to the request.
2. Make the smallest source or docs change that satisfies the task; avoid generated, vendored, or local-environment files unless required.
3. Run the narrowest useful validation first, then `npm test` or the documented package/platform gate when available.
4. If a required SDK, service credential, or external runtime is unavailable, record the skipped command and why.
5. Summarize changed files, commands run, and remaining risks or follow-up validation.
