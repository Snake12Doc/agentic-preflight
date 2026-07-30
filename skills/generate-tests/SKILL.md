---
name: generate-tests
description: Generate focused tests for a code change, then verify them through agentic-preflight.
---

# Generate Tests

Use this skill when a change needs new or updated automated tests.

## Workflow

1. Inspect the changed production code and nearby tests.
2. Identify observable behavior, edge cases, and failure paths.
3. Follow the project's existing test framework and naming conventions.
4. Make the smallest test changes that cover the behavior.
5. Call the `list_checks` MCP tool and identify the relevant test check.
6. Call `run_check` with that check name.
7. Fix failures caused by the change and rerun the check.

## Guardrails

- Do not weaken assertions to make a test pass.
- Do not delete coverage without explaining why behavior is obsolete.
- Avoid tests that depend on execution order, external services, or wall-clock timing.
- Report unrelated failures instead of modifying unrelated code.
