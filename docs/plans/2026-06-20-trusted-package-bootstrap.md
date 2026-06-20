# Trusted Package Bootstrap v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Authenticate one exact semantic repair with a base-owned verifier and dedicated GitHub App check.

**Architecture:** Land an inert bootstrap first, then accept only a one-commit semantic repair whose complete binary diff and deterministic package archive match base-owned SHA-256 policy. The base-controlled `pull_request_target` workflow never executes candidate bytes and reports through a repository-scoped GitHub App.

**Tech Stack:** GitHub Actions, Python 3 isolated mode, Git object inspection, deterministic gzip/tar, Node.js/npm.

---

## Decision

Use a two-phase, base-controlled verifier before attempting another package repair.
The bootstrap is inert with respect to the published plugin: it adds a trusted
workflow, verifier, policy, exact semantic patch, tests, and this design record.
It does not change `package.json`, the lockfile, runtime source, launchers, or the
ordinary `Check` workflow.

The rejected v1-v3 commits remain siblings and must never enter the ancestry of
either phase. The semantic content selected from v3 is stored only as inert patch
data. Its self-checker, quiescence probe, and tests are not trusted. The trusted
verifier accepts the semantic phase only when its complete repository diff is
byte-for-byte equal to the patch stored in
`.github/trusted/semantic-v1.patch.gz` and its package archive
matches the closed file, mode, and SHA-256 inventory in
`.github/trusted/policy.json`.

## Why a dedicated Check App is required

GitHub required status checks do not distinguish workflow files, matrix entries,
or trigger types. A pull-request workflow can therefore publish the same context
name through the GitHub Actions App. The existing four `test (...)` contexts are
useful signals but are not an authentication boundary.

The decisive context is `trusted-package/bootstrap-v1`, created by a dedicated
GitHub App with `checks:write` permission. Branch protection must require that
context with the dedicated App selected as its expected source. A check with the
same name from GitHub Actions has a different App identity and cannot satisfy the
requirement.

The App ID and private key belong to the `trusted-package-verifier` environment.
Configure that environment for the selected branch `main` only and disable
administrator bypass. The `pull_request_target` workflow runs from base-controlled
bytes and has `main` as its ref. Candidate-controlled `pull_request` workflows use
a pull-request ref and cannot enter the environment or read its App credentials.

Do not make the workflow job's GitHub Actions context the required gate. The only
decisive required context is the check emitted by the dedicated App.

## Phase 1: bootstrap and trust-root rollout

1. Obtain an independent exact-head hostile approval for this replacement bootstrap.
2. Publish the bootstrap pull request and run the existing four Linux/Windows checks.
3. Merge only through the existing manual process and only with explicit user authorization.
4. Create and install a dedicated GitHub App on only this repository with only
   `checks:write`.
5. Create the `trusted-package-verifier` environment, restrict deployments to selected
   branch `main`, and disable administrator bypass before storing any secret.
6. Store `TRUSTED_CHECK_APP_ID` and `TRUSTED_CHECK_APP_PRIVATE_KEY` as environment
   secrets only after the restrictions in step 5 are active.
7. Open harmless same-repository and fork pull requests. Prove the base-controlled
   workflow reads no PR executable bytes, reports on the exact head SHA, works for fork
   heads, leaks neither credential, and revokes the short-lived installation token.
8. Add `trusted-package/bootstrap-v1` to branch protection with the dedicated App's
   exact `app_id`; preserve `strict: true` and administrator enforcement.
9. Create a same-name GitHub Actions check and prove it is rejected as an unexpected
   source. Verify the final rule through the branch-protection API, not only the UI.

No semantic repair may be opened or merged before all nine steps are complete.

## Phase 2: exact semantic repair

Create one new commit whose sole parent is the merged bootstrap default. Apply the
patch exactly with
`gzip -dc .github/trusted/semantic-v1.patch.gz | git apply`. Do not copy,
cherry-pick, merge, or rebase rejected v1-v3 commits. The authenticated patch's
only workflow change is the reviewed `.github/workflows/check.yml` hunk that raises
the timeout from 10 to 20 minutes and replaces `npm pack --dry-run` with
`node scripts/build-package.js --verify-only`. Do not make any other workflow
change, and do not modify `.github/trusted` or this bootstrap design.

Require the dedicated App check together with all four Linux/Windows behavior checks,
audit/package evidence, and CodeQL. Perform another exact-head hostile review. Do not
weaken or remove the behavior checks, and do not merge without explicit user authorization.

The trusted workflow fetches the pull-request head into a bare Git repository. It
never checks out the candidate and never runs `npm`, Node, package scripts, shell
files, tests, or any other candidate-controlled code. It verifies:

- the head is one commit with the live base as its sole parent;
- the full binary patch has the base-owned SHA-256
  `b514da6c7e702844f3a862c465f457a4d6b20a13fb00f0dd457570886cb11e28`;
- the deterministic package tar contains exactly eight regular files;
- every package path, mode, and content digest matches the base-owned policy;
- `package.json` has only the four reviewed non-lifecycle scripts; and
- the archive has no links, traversal, duplicate members, generated files, or
  nondeterministic ownership and timestamp metadata.

This closed inventory structurally excludes `Atomics.waitAsync`, workers, timers,
child processes, extra shared-state modules, lifecycle-generated files, and
coordinated verifier laundering. A candidate cannot add or alter any byte while
preserving both the exact patch digest and the package member digests.

## Environment isolation

The workflow starts each trusted Python process with `env -i` and
`/usr/bin/python3 -I -S`, so inherited `PYTHONHOME`, `PYTHONPATH`,
`PYTHONSTARTUP`, and `sitecustomize` hooks cannot participate. It also clears
`NODE_OPTIONS`, `NODE_PATH`, `BASH_ENV`, and `ENV`; forces npm script suppression;
disables system and global Git configuration; uses a fixed system path; fetches
without tags, hooks, submodules, or file protocol; and invokes only base-owned
Python. The candidate is data, never executable code.

## Frozen patch verification

Before freezing the digest above, the complete 28-file patch was applied with
`git apply --check` and `git apply` to a fresh clone at signed default
`756bb270124a981bef747931a7817a3ead5f5257`. `npm ci --ignore-scripts` and the full
`npm test` suite then passed on Node 22.13.0/npm 10.9.2, Node 24.12.0/npm 11.6.2,
and Node 25.8.1/npm 11.11.0. The changed-file inventory includes
`.github/workflows/check.yml` with both required hosted-check updates. Real hosted
Linux and Windows execution remains mandatory after publication.

## What this proves

- The phase-two repository diff is exactly the reviewed semantic patch.
- The phase-two package bytes are exactly the reviewed eight-file package.
- The candidate cannot substitute its own policy, verifier, runner, workflow, or
  test to create a green result.
- The decisive check is attributable to a dedicated GitHub App rather than the
  spoofable GitHub Actions App.

## What this does not prove

- The bootstrap does not remediate the currently landed vulnerable package.
- The bootstrap does not configure or install the GitHub App, environment, secrets,
  or branch protection rule; those are mandatory external administration steps.
- The ordinary v3 self-checker is not made trustworthy by freezing it.
- The trusted verifier does not execute the package and therefore does not prove
  behavior on Linux, Windows, a real Twilio host, or any Node version.
- The trusted verifier does not resolve the Twilio CLI host's independent advisory
  baseline.
- The exact semantic patch still needs hosted behavior, compatibility, audit, and
  CodeQL evidence after its authenticated static check succeeds.

## References

- GitHub documents that required status checks do not account for workflow, matrix,
  or trigger identity: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/troubleshooting-rules>
- GitHub documents selecting an expected GitHub App source for a required check:
  <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#require-status-checks-to-pass-before-merging>
- GitHub documents environment branch restrictions and protected secrets:
  <https://docs.github.com/en/actions/reference/deployments-and-environments>
- GitHub warns that `pull_request_target` must not execute untrusted code:
  <https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target>
