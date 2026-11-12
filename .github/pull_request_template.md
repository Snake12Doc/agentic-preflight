## Summary

<!-- Explain the reviewable delivery and why it is needed. -->

## Delivery scope

- Included work units (local IDs, when applicable):
- Acceptance criterion for this delivery:
- Remaining dependencies or cross-repository work:

## Branch flow

- Source branch: `feature/...`, `release/...`, `hotfix/...`, or `main`
- Target branch: `develop` or `main`
- [ ] The branch starts from the correct base and follows [AGENTS.md](https://github.com/Snake12Doc/agentic-preflight/blob/develop/AGENTS.md#ramas-y-contribución).

## Validation

- [ ] `npm run check`
- [ ] Relevant behavior is verified and functional documentation/progress updated.
- [ ] Local planning documents are not included in the changes.
- [ ] Spring Boot changes: `mvn --batch-mode verify` from the example, if applicable.

<!-- Record actual results and explain checks that were not applicable.
For ArchSentinel integration, record its SHA and verification separately. -->

## Release or hotfix follow-up

<!-- When applicable: package/lockfile version, changelog, tag, and back-merge PR
to develop. Remove this section for ordinary feature PRs. -->
