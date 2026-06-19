# Unicode Line Separator Name Sanitization

status: completed

## Context

Learner names are stripped of Unicode control (`Cc`) and format (`Cf`)
characters before terminal output. Unicode line separator (`Zl`) and paragraph
separator (`Zp`) characters remain, allowing prompt input to split the greeting
across terminal lines despite the existing single-line output boundary.

## Requirements

- Remove Unicode `Zl` and `Zp` characters together with the existing `Cc` and
  `Cf` categories before trimming and code-point truncation.
- Preserve ordinary Unicode text, the `there` fallback, the 80-code-point
  limit, prompt behavior, and greeting text.
- Add focused U+2028 and U+2029 helper and interactive-command regressions.
- Add mutation-sensitive source, test, guidance, and completed-plan contracts.

## Scope Boundaries

- Do not change dependencies, package metadata, command IDs, examples,
  clipboard behavior, prompt choices, Twilio authentication, or live API calls.
- Do not introduce grapheme-cluster semantics or restore intentionally removed
  Unicode format characters.

## Implementation Units

### U1. Extend The Terminal Separator Guard

**Goal:** Keep learner names on one terminal line.

**Files:** `src/commands/cli-101-training/welcome.js`,
`test_welcome_name_format.js`

**Approach:** Extend the existing Unicode property regex to include `Zl` and
`Zp`, retaining the current replacement, trim, fallback, and code-point slice
order.

**Execution note:** Add failing helper and interactive greeting fixtures before
changing the regex.

**Test scenarios:**

- U+2028 and U+2029 are removed from helper output.
- An interactive name containing both separators produces one normalized
  greeting line.
- Existing controls, emoji boundary, fallback, and length cases remain green.

**Verification:** The focused test rejects the old regex and passes with all
four Unicode categories.

### U2. Preserve The Regression Contract

**Goal:** Prevent separator handling from silently regressing.

**Files:** `scripts/check-baseline.js`, `README.md`, `SECURITY.md`, `VISION.md`,
`CHANGES.md`, `docs/plans/2026-06-15-unicode-line-separator-name-sanitization.md`

**Approach:** Require the exact category guard, both separator fixtures,
single-line interactive output, synchronized guidance, and completed
verification evidence.

**Test scenarios:** The checker rejects removed `Zl`, removed `Zp`, missing
helper fixtures, missing interactive coverage, missing guidance, and reopened
plan status.

**Verification:** Focused and complete package gates, external Make validation,
hostile mutations, audit, lockfile, and artifact checks pass.

## Risks

- Learner names intentionally lose line and paragraph separators instead of
  preserving them as visible spacing.
- The plugin remains on its current Twilio-compatible oclif dependency line.
- This change must remain stacked on PR #4 and follow base-first merge order.

## Work Completed

- Extended learner-name terminal sanitization from Unicode control and format
  characters to line and paragraph separators.
- Added direct U+2028/U+2029 formatter cases and an interactive single-line
  greeting regression while preserving fallback and code-point truncation.
- Added static source, test, documentation, and completed-plan contracts.

## Verification Completed

- `node test_welcome_name_format.js`, `npm test`, `npm run lint`, and
  `npm run build` passed on Node 22.
- `make check` passed from the repository root and an external working directory
  through the absolute Makefile path.
- `npm pack --dry-run` preserved the reviewed package contents. The unchanged
  `npm audit --audit-level=low` gate exposed a separate js-yaml upstream blocker
  recorded in `docs/plans/2026-06-15-transitive-advisory-remediation.md`.
- Six isolated hostile mutations were rejected for missing `Zl`, missing `Zp`,
  removed helper fixtures, removed interactive coverage, missing guidance, and
  reopened plan status.
- `git diff --check` plus exact diff and lockfile audits passed; secret and generated-artifact audits passed.
