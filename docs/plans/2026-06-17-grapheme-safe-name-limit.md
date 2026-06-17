# Grapheme-Safe Learner Name Limit

status: planned

## Problem

Learner names are sanitized and truncated to 80 Unicode code points. That
avoids splitting surrogate pairs, but it can still split a user-perceived
character at the boundary, including a regional-indicator flag or a base letter
with a combining mark. The supported Node 22.13 runtime provides
`Intl.Segmenter`, so the limit can operate on grapheme clusters without adding a
dependency.

## Prioritized Requirements

- P0. Truncate sanitized learner names to 80 grapheme clusters.
- P0. Preserve complete flag and combining-mark graphemes at the boundary.
- P1. Preserve existing null fallback, trimming, terminal-control removal,
  interactive command behavior, and ordinary ASCII/emoji output.
- P1. Add mutation-sensitive tests, static contracts, synchronized guidance,
  and completed verification evidence.

## Implementation Units

### U1. Grapheme segmentation

**File:** `src/commands/cli-101-training/welcome.js`

Create one reviewed `Intl.Segmenter` for grapheme granularity and use its
segments for the existing 80-character limit after sanitization.

### U2. Boundary regressions

**File:** `test_welcome_name_format.js`

Add exact cases for a flag and a combining sequence at the 80-grapheme
boundary, while retaining the current control, separator, code-point, and
interactive-path assertions.

### U3. Contracts and guidance

**Files:** `scripts/check-baseline.js`, `README.md`, `SECURITY.md`, `VISION.md`,
`CHANGES.md`, `docs/plans/2026-06-17-grapheme-safe-name-limit.md`

Protect the segmenter configuration, segment extraction, boundary tests,
guidance, and completed plan evidence against isolated hostile mutations.

## Validation

- Run the focused learner-name suite, full npm/Make gates, strict audit policy,
  fresh locked install, and package dry run.
- Run gates through the absolute Makefile path from an external directory.
- Reject isolated mutations of segmenter granularity, segment extraction,
  truncation, regressions, guidance, and completed plan status.
- Audit the exact stacked diff, generated artifacts, credentials, conflict
  markers, modes, binaries, large files, and whitespace before committing.

## Scope Boundaries

- Do not change the 80-grapheme limit or terminal-control removal policy.
- Do not restore format controls such as zero-width joiners; that broader
  sanitization policy remains unchanged.
- Do not change dependencies, command IDs, prompts, packaging, audit policy, or
  the exact Node 22.13 runtime floor.
- Do not merge or close any stacked pull request.

## Risks

- Locale-neutral grapheme segmentation intentionally follows the runtime's
  Unicode implementation; supported Node lanes must remain authoritative.
- Format controls are removed before segmentation, so joined emoji sequences
  remain outside this narrow change.
- This change is stacked on PR #6, which must remain open and merge first.
