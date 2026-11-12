# agentic-preflight

**English** | [Español](README.es.md)

Local quality gates for AI coding agents, exposed through both a CLI and an
MCP server.

`agentic-preflight` lets a project owner define the exact tests, builds, static
analysis, and formatting checks an agent may run. Agents select checks by name;
they never submit arbitrary shell commands.

## Why

AI-assisted development is faster when feedback arrives before a pull request,
but speed should not require bypassing deterministic quality controls. This
project makes existing project checks discoverable and executable by agents
while keeping command selection under repository control.

## Features

- CLI for initializing, running, and reporting project checks.
- MCP server with four focused tools.
- Executable allowlist, bounded timeouts, no shell interpolation.
- Persistent JSON reports for agent and human review.
- Automatic starter configuration for Maven, npm, pnpm, and Yarn projects.
- Reusable skills for test generation, code review, and PR preflight.
- Complete Spring Boot example.

## Requirements

- Node.js 20 or later.
- The build tools required by the configured project checks.

## Quick start

```bash
npm install --save-dev agentic-preflight
npx agentic-preflight init
npx agentic-preflight check
```

Until the package is published, clone the repository and use the local build:

```bash
npm install
npm run build
node dist/cli.js --help
```

## Configuration

`agentic-preflight init` creates `agentic-preflight.json` in the current
project. A Maven configuration can look like this:

For Node.js projects, initialization detects test, lint, typecheck, build,
format checking, integration, and end-to-end package scripts when present.

```json
{
  "version": 1,
  "checks": {
    "test": {
      "command": "./mvnw",
      "args": ["test"],
      "description": "Run unit and integration tests",
      "timeoutMs": 300000
    },
    "quality": {
      "command": "./mvnw",
      "args": ["verify", "-Pquality"],
      "description": "Run static analysis and quality rules"
    }
  },
  "security": {
    "allowedExecutables": ["./mvnw"],
    "maxTimeoutMs": 300000
  }
}
```

Commands are executed directly, without a shell. Features such as pipes,
redirects, command substitution, and `sh -c` are intentionally unsupported.
Checks receive `CI=true` by default to prevent interactive prompts; an existing
`CI` environment value is preserved.

## CLI

```text
agentic-preflight init               Create a starter configuration
agentic-preflight check              Run every configured check
agentic-preflight check test quality Run selected checks in order
agentic-preflight test               Run the check named "test"
agentic-preflight report             Print the latest saved report
agentic-preflight mcp                Start the stdio MCP server
```

Set `AGENTIC_PREFLIGHT_ROOT` when the MCP client starts the server from a
different directory.

## MCP server

Example client configuration after installing the package:

```json
{
  "mcpServers": {
    "agentic-preflight": {
      "command": "npx",
      "args": ["-y", "agentic-preflight", "mcp"],
      "env": {
        "AGENTIC_PREFLIGHT_ROOT": "/absolute/path/to/project"
      }
    }
  }
}
```

For a local checkout, replace `npx` with `node` and pass the absolute path to
`dist/cli.js` before the `mcp` argument.

### Tools

| Tool | Purpose |
| --- | --- |
| `list_checks` | List the checks an agent is allowed to run. |
| `run_check` | Run one named check and save its report. |
| `run_preflight` | Run every check or a selected subset. |
| `latest_report` | Read the most recent persisted report. |

## Skills

The `skills` directory contains provider-neutral workflows:

- `generate-tests` creates focused tests and verifies them.
- `review-changes` reviews a diff and runs deterministic gates.
- `preflight-pr` confirms readiness before a pull request.

Copy or reference these skills from the agent configuration used by your
project. They rely only on the MCP tools documented above.

## Spring Boot example

```bash
npm run build
AGENTIC_PREFLIGHT_ROOT="$PWD/examples/spring-boot-demo" \
  node dist/cli.js check
```

The example demonstrates Maven test and package checks without requiring any
private application code.

## Security model

- MCP arguments can select check names, not executables or arguments.
- Every configured executable must appear in an explicit allowlist.
- Relative executable paths and symlinks cannot escape the project root;
  absolute paths must be explicitly allowlisted.
- Child processes run without a shell and with a configurable maximum timeout.
- Tool errors are sanitized and stdout is reserved for the MCP protocol.

The repository configuration remains trusted code. Review changes to
`agentic-preflight.json` before running checks from an untrusted branch.

## Development

Follow the [contribution instructions](AGENTS.md#ramas-y-contribución) for the same Git Flow used by
ArchSentinel: planned work starts in `feature/*` from `develop` and returns to
`develop` through a PR. `main` holds the stable production line.

A branch may contain several related work units that form one reviewable delivery.
Releases start from `develop` and target `main`; hotfixes start from `main`.
Both are synchronized back into `develop`. CI validates PR branch routes.
Roadmaps and working notes remain local and are excluded from version control.

```bash
npm install
npm run check
```

The test suite covers configuration validation, success, failure and timeout
behavior, and a real MCP stdio client/server round trip.

## License

MIT
