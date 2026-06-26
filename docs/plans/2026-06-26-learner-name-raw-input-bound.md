# Learner Name Raw Input Bound

status: completed

## Scope

Bound learner-name prompt work before Unicode sanitization and grapheme
segmentation without weakening the existing terminal-safety or display limits.

## Baseline

The welcome command capped sanitized output at 160 code points, 1024 UTF-8
bytes, and 80 grapheme clusters. It first applied a global Unicode sanitization
regular expression to the entire raw string, so a pasted prefix of 100,000
invisible format characters was fully scanned and then discarded before a
trailing name was displayed.

## Work Completed

- Bound raw input at 320 code points and 1024 UTF-8 bytes before Unicode
  sanitization.
- Reuse the same bound for final formatting and the interactive prompt
  transformer.
- Preserve the existing output code-point, byte, grapheme, trimming, and
  terminal-control rules.
- Add direct raw-bound assertions and interactive prompt evidence.
- Add four isolated hostile mutations covering both call sites and both caps.
- Bind source, tests, mutations, documentation, and this plan into the
  dependency-free baseline.

## Verification Completed

- Focused red/green `node test_welcome_name_format.js` on Node 24.18.0.
- `node test_welcome_input_bound_mutations.js` rejected four isolated hostile mutations.
- Node 22.13.0 and Node 24.18.0 full repository gates passed.
- The zero-finding dependency audit, package dry run, and external working
  directory execution passed on Node 24.18.0.
- Hosted Linux/Windows checks remain required before merge.
