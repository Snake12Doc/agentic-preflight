# Security

## Design

`agentic-preflight` never accepts arbitrary shell commands through MCP. Agents
can only select checks already present in `agentic-preflight.json`, and each
executable must also be declared in `security.allowedExecutables`.

Processes are spawned without a shell, receive arguments as an array, run with
a bounded timeout, and have their captured output truncated. Relative
executables containing a path must resolve inside the project root. Absolute
executables must be explicitly allowlisted in the trusted project configuration.
Relative paths are resolved through symlinks before the containment check.

The configuration file is trusted project code. Review changes to it with the
same care as changes to CI workflows or build scripts.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could put users at risk.
Contact the maintainer privately with reproduction steps, affected versions,
and the expected impact.
