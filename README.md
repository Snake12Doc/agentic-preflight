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

## TypeScript architecture fixture

`examples/archsentinel-demo` contains a minimal order use case. Its application
layer depends on domain; domain has no permitted layer dependencies. The
`architecture.yaml` contract declares these boundaries and code-quality limits.

Prepare the example with Node.js 20 or newer, Git and pnpm 10.27.0 available.
Cloning ArchSentinel requires repository access and working GitHub SSH credentials.
From the preflight repository root, choose a new absolute destination outside this
checkout whose parent directory already exists (POSIX shell):

```bash
npm ci
npm run build

export ARCHSENTINEL_ROOT="/absolute/path/to/new/ArchSentinel-f1"
git clone --no-checkout git@github.com:Snake12Doc/ArchSentinel.git "$ARCHSENTINEL_ROOT"
git -C "$ARCHSENTINEL_ROOT" checkout --detach ba2d2d92d45c69cbedb780b7faecf35c26a8ebf9
pnpm --dir "$ARCHSENTINEL_ROOT" install --frozen-lockfile
pnpm --dir "$ARCHSENTINEL_ROOT" build
export ARCHSENTINEL_CLI="$ARCHSENTINEL_ROOT/dist/cli.js"
```

This pins ArchSentinel 0.3.0 by commit and builds it separately, preserving any
existing ArchSentinel work. Provision pnpm before starting; Node.js installations
do not always include Corepack. Only preparation requires dependency downloads.

For a standalone architecture check, run from `examples/archsentinel-demo` with
the exported absolute CLI path:

```bash
node "$ARCHSENTINEL_CLI" check --language typescript --format json
```

The valid fixture produces `status: "PASS"` with no findings. The check runs
directly through ArchSentinel, using already installed dependencies. To check
the fixture's TypeScript from the preflight repository root after `npm ci`:

```bash
node node_modules/typescript/bin/tsc --project examples/archsentinel-demo/tsconfig.json
```

The fixture also defines `test`, `typecheck`, and `architecture` preflight checks.
After installing the root dependencies and building preflight, run all three from
the repository root (POSIX shell):

```bash
AGENTIC_PREFLIGHT_ROOT="$PWD/examples/archsentinel-demo" \
  node dist/cli.js check
```

`ARCHSENTINEL_CLI` is read by the example's wrapper script, not interpolated by
preflight. It must point to the separately built CLI above. The wrapper invokes
Node directly without a shell and preserves the architecture CLI's exit code.
The config contains no machine-specific paths and uses the root TypeScript/tsx
dependencies; the example therefore runs inside this repository checkout.
No package download occurs during the checks. The report is saved under the
example's `.agentic-preflight/latest-report.json`.

### Results and reports

The CLI has two levels of exit codes: preflight `check` returns `0` when every
selected check passes and `1` otherwise; each saved `results[]` entry retains the
external process's own `exitCode`. The following outcomes were verified with the
example and the pinned ArchSentinel CLI above:

| Scenario | Check `status` | Process `exitCode` | Diagnostic location | Preflight `check` exit | Latest report |
| --- | --- | --- | --- | --- | --- |
| Valid architecture | `passed` | `0` | Check stdout: JSON `PASS` | `0` | New, `passed: true` |
| Forbidden layer dependency | `failed` | `1` | Check stdout: JSON `FAIL`, including `HEX-001` | `1` | New, `passed: false` |
| Invalid architecture contract | `failed` | `2` | Check stderr: JSON `ERROR` of type `configuration` | `1` | New, `passed: false` |
| Executable cannot start, no prior report | No new result | — | Preflight CLI stderr: `Unable to run … ENOENT` | `1` | Absent |
| Executable cannot start, prior report exists | No new result | — | Preflight CLI stderr: `Unable to run … ENOENT` | `1` | Previous report unchanged |
| External check times out | `timed_out` | `null` in the captured POSIX run | Partial output in the check's stdout/stderr | `1` | New, `passed: false` |

Here, check stdout/stderr means the strings stored in the report, not preflight's
own terminal streams. Preflight writes human-readable summaries to CLI stdout;
for a non-passing check it also displays that check's stderr, or stdout if stderr
is empty. Thus the contract error JSON is stored in **check stderr** but displayed
on **preflight CLI stdout**. Successful check output remains in the report.
Preflight stdout is not a JSON report and the architecture JSON remains a string
inside the generic check result.

`timed_out` is the timeout indicator: its process code can be null or vary with
the platform and termination method. The timeout capture used a controlled
process, not a completed ArchSentinel review; partial output need not be JSON.
Remaining checks continue after a timeout. On POSIX the runner sends SIGTERM to
the process group, then schedules SIGKILL 500 ms later even if the immediate
process exits first. Windows uses `taskkill /t /f`.

An executable launch exception aborts before saving a new report; — above means
there is no process result, rather than a recorded null exit code. A previous
report may therefore still describe an older successful run. Check `startedAt`,
`finishedAt` and the selected results when reading `.agentic-preflight/latest-report.json`.
The `report` command only displays the stored run and returns `0` if it can read
it, even when `passed` is false; use `check`, not `report`, as a CI gate.

The JSON `PASS`/`FAIL`/`ERROR` meanings above belong to ArchSentinel in JSON mode.
Preflight does not interpret exit code `2` as a universal error category for all
tools; other commands or wrapper failures can return plain-text diagnostics.

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
GitHub automatically deletes source branches after merging PRs. Release and
hotfix branches are retained until both integrations, as described in AGENTS.
Roadmaps and working notes remain local and are excluded from version control.

```bash
npm install
npm run check
```

The test suite covers configuration validation, success, failure and timeout
behavior, and a real MCP stdio client/server round trip.

The external ArchSentinel CLI integration tests are opt-in. To include them,
provide the absolute path to the separately built CLI described above:

```bash
ARCHSENTINEL_CLI="$ARCHSENTINEL_ROOT/dist/cli.js" npm run check
```

These tests copy the example into temporary directories and verify both a valid
project and a forbidden domain-to-infrastructure dependency. In the latter case,
functional tests and types still pass while the architecture gate fails. Without
`ARCHSENTINEL_CLI`, these integration cases are skipped; the normal suite remains
independent of an ArchSentinel installation. A configured invalid path fails setup.

The suite also checks invalid architecture contracts. See the
[result matrix](#results-and-reports) for exit codes, output streams and report
persistence. Launch-error and timeout tests use controlled processes and run
without an ArchSentinel installation, including previous-report preservation
and process startup/termination checks.

## License

MIT
