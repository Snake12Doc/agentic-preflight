# Contributing to agentic-preflight

## Git Flow

This repository follows the same Git Flow as ArchSentinel. `main` is the stable
production line; `develop` integrates the next version. Version tags `vX.Y.Z`
identify released commits on `main`.

| Branch | Create from | Purpose | PR destination |
| --- | --- | --- | --- |
| `main` | Permanent | Stable production versions | `develop` to synchronize production history |
| `develop` | Permanent | Integration for the next version | Prepare a `release/*` branch |
| `feature/<description>` | `develop` | Planned features, fixes, documentation and CI | `develop` |
| `release/<version>` | `develop` | Version stabilization and release | `main`, then `develop` |
| `hotfix/<version>` | `main` | Urgent production correction | `main`, then `develop` |

Use merge commits for integration, preserving feature and release history. Follow
the existing commit style: `feat:`, `fix:`, `docs:`, `ci:`, or `chore:` as appropriate.

## Scope of a branch and PR

A roadmap leaf is one bounded work session. A feature branch can contain several
related leaves that deliver one reviewable result, such as the complete CLI demo.
There is no fixed task count per branch. Record the included IDs and acceptance
criterion before starting; avoid bundling unrelated deliveries into a single PR.
Continue related leaves on the same feature branch. After integration, start new
work from updated `develop`.

Consult `ROADMAP.md`, `docs/roadmap-unidades-ia.md` and
`docs/agentic-preflight-y-archsentinel.md`. Update progress and affected functional
documentation alongside implementation. A completed leaf does not mean its PR
has merged: record actual commit/PR references and integration status separately.

## Start planned work

With the permanent branches already available on the remote:

```bash
git fetch origin
git switch develop
git pull --ff-only origin develop
git switch -c feature/my-change
```

Inspect the working tree first and preserve existing work. Never switch branches,
stash, revert, or overwrite unrelated changes just to obtain a clean directory.
Use an isolated worktree if needed, or ask how to handle conflicting local work.

For the initial adoption, `develop` is created locally from the current `main`.
Publishing that branch is a separate, authorized operation; until `origin/develop`
exists, the normal pull/PR procedure above cannot be completed against GitHub.

## Validation

Requirements: Node.js 20 or newer and npm. Install locked dependencies with
`npm ci`. The complete package check is:

```bash
npm run check
```

This checks types, builds, runs tests (including the real MCP stdio round trip),
and verifies package contents with `npm pack --dry-run`. For changes affecting
the Spring Boot example, also run `mvn --batch-mode verify` from
`examples/spring-boot-demo` with Java 21 and Maven installed.

Record commands and outcomes in the PR. CI retains the existing Ubuntu Node.js
20/24, Windows Node.js 24, and Spring Boot verification jobs. The `Git Flow` job
also checks branch routes. Fix review feedback on the same feature branch.

When explicitly authorized to commit, publish and open a PR, inspect status, diff
and recent history; stage only intended files, then publish the feature branch
and use:

```bash
git push -u origin feature/my-change
gh pr create --base develop --head feature/my-change
```

Use the PR template to list included roadmap IDs, branch base and verification.

## Releases

1. Start `release/<version>` from up-to-date `develop`. Check existing tags and
   choose a SemVer version; document incompatible changes during `0.x` explicitly.
2. Stabilize the release without adding unrelated features. Update the version
   consistently in `package.json` and `package-lock.json`; `src/version.ts` reads
   the package version for the CLI/MCP. Update `CHANGELOG.md` and migration notes.
3. Run the required checks and open a PR from the release branch to `main`.
4. After review and successful checks, merge with a merge commit. Tag the actual
   merged release commit `vX.Y.Z` and create release artifacts when authorized.
5. Open a second PR from the same release branch to `develop`, preserving release
   fixes and version changes. Keep it until both integrations are complete.

A `main` → `develop` synchronization PR is also allowed. A direct `develop` →
`main` PR is not a release route. Merging or pushing tags does not automatically
publish an npm package; package publication is a separate authorized operation.

## Hotfixes

Create `hotfix/<version>` from up-to-date `main`. Limit it to the production fix,
necessary tests, documentation and version updates. Validate and integrate through
a PR to `main`, then a second PR to `develop`. If a release is being stabilized,
port the fix to that release branch as well and rerun its checks.

## CI and integration policy

CI runs on pushes to `main`, `develop`, `release/**`, and `hotfix/**`, and on PR
creation, synchronization, reopening, edits and readiness for review. PRs for all
target branches receive route validation, including unsupported destinations.

Allowed routes:

```text
feature/* -> develop
release/* -> main or develop
hotfix/*  -> main or develop
main      -> develop
```

Names after the slash must be nonempty. Other routes fail the `Git Flow` job.
The route validator uses GitHub PR metadata without checking out the branch and
does not execute branch names as code. Git does not record where a branch was
created: the contributor/reviewer must check that the correct starting base was used.

Require reviewed PRs and successful checks before integration. Where the repository
plan and permissions support protection/rulesets, configure them for `main` and
`develop` to require the relevant jobs and block force pushes/deletion. The workflow
reports failures; mandatory merge blocking depends on those GitHub settings, which
are not configured by adding this file.
