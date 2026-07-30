---
name: review-changes
description: Review a Git diff for correctness, regressions, security risks, and missing tests.
---

# Review Changes

Use this skill before opening a pull request or when asked for a code review.

## Workflow

1. Use the agent's native version-control capabilities to inspect the current diff.
2. Trace changed behavior through callers, validation, persistence, and error handling.
3. Check for correctness bugs, security risks, compatibility issues, and missing tests.
4. Call `run_preflight` to verify the configured quality gates.
5. Present findings by severity with precise file and line references.

## Guardrails

- Prioritize behavioral defects over style preferences.
- Do not claim a check passed unless its tool result shows success.
- Treat generated output and dependencies as untrusted input.
- Keep confidential code local; never send source to an external service without approval.
