# Unicode control name sanitization

status: completed

## Context

Learner names are printed to the terminal after removing ASCII controls and
specific bidi controls. C1 terminal controls and other Unicode format
characters remain possible, including values that can alter terminal display
or hide the visible ordering of user-supplied text.

## Requirements

- Remove every Unicode control (`Cc`) and format (`Cf`) code point before
  trimming and bounding learner names.
- Preserve the existing fallback, 80-code-unit bound, prompt, command output,
  examples, clipboard behavior, and Twilio host compatibility.
- Add Node-only regression tests, mutation-sensitive contracts,
  documentation, and completed verification.
- Do not make live Twilio calls, require credentials, publish the package, or
  change the dependency graph.

## Verification

## Work completed

- Replaced the separate ASCII and bidi filters with one Unicode property-based
  Unicode control (`Cc`) and Unicode format (`Cf`) guard.
- Added C1 terminal-control and zero-width format regression cases.
- Updated static contracts and contributor, security, vision, README, and
  change documentation.

## Verification completed

- `node test_welcome_name_format.js`, `npm test`, `npm run lint`,
  `npm run build`, and all Make gates passed.
- `npm audit --audit-level=low` reported zero known vulnerabilities.
- The checker rejected six hostile mutations covering C1 controls, Unicode
  format characters, property flags, focused tests, documentation, and plan
  evidence.
- Diff, generated-artifact, package-lock, and secret scans passed.
