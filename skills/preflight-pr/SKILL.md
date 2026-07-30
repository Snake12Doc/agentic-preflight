---
name: preflight-pr
description: Run deterministic quality gates and summarize readiness before a pull request.
---

# Preflight Pull Request

Use this skill immediately before creating or updating a pull request.

## Workflow

1. Call `list_checks` and explain which checks will run.
2. Inspect the diff with the agent's native version-control capabilities and confirm it contains only intended changes.
3. Call `run_preflight` without a filter to run every configured gate.
4. If a check fails, inspect its output and address only failures related to the change.
5. Rerun failed checks, then call `latest_report` for the final result.
6. Summarize passed checks, remaining risks, and any checks that could not run.

## Guardrails

- Never bypass, remove, or silently relax a quality gate.
- Ask before making destructive or unrelated changes.
- Do not state that a pull request is ready while any required check is failing.
