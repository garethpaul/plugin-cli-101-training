# Unicode control name sanitization

status: planned

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

- Run focused tests, all npm and Make gates, hostile mutations, diff checks,
  artifact scans, secret scans, and the installed dependency audit.
