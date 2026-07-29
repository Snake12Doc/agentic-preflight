#!/usr/bin/env node

import { resolve } from "node:path";
import { initializeConfig, loadConfig } from "./config.js";
import { loadLatestReport, runChecks, saveReport } from "./runner.js";
import { startMcpServer } from "./server.js";
import type { PreflightReport } from "./types.js";
import { VERSION } from "./version.js";
const root = resolve(process.env.AGENTIC_PREFLIGHT_ROOT ?? process.cwd());

const HELP = `agentic-preflight ${VERSION}

Local quality gates for AI coding agents.

Usage:
  agentic-preflight init
  agentic-preflight check [check...]
  agentic-preflight test
  agentic-preflight report
  agentic-preflight mcp

Environment:
  AGENTIC_PREFLIGHT_ROOT  Project directory used by the CLI and MCP server
`;

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function printReport(report: PreflightReport): void {
  for (const result of report.results) {
    const marker = result.status === "passed" ? "PASS" : result.status.toUpperCase();
    process.stdout.write(`${marker.padEnd(9)} ${result.name} (${formatDuration(result.durationMs)})\n`);
    if (result.status !== "passed") {
      const output = result.stderr || result.stdout;
      if (output) {
        process.stdout.write(`${output}\n`);
      }
    }
  }
  process.stdout.write(`\nPreflight ${report.passed ? "passed" : "failed"}.\n`);
}

async function main(): Promise<void> {
  const [command = "help", ...args] = process.argv.slice(2);

  switch (command) {
    case "init": {
      const path = await initializeConfig(root);
      process.stdout.write(`Created ${path}\n`);
      break;
    }
    case "check": {
      const config = await loadConfig(root);
      const report = await runChecks(root, config, args);
      await saveReport(root, report);
      printReport(report);
      if (!report.passed) {
        process.exitCode = 1;
      }
      break;
    }
    case "test": {
      const config = await loadConfig(root);
      if (!("test" in config.checks)) {
        throw new Error("No check named 'test' is configured");
      }
      const report = await runChecks(root, config, ["test"]);
      await saveReport(root, report);
      printReport(report);
      if (!report.passed) {
        process.exitCode = 1;
      }
      break;
    }
    case "report": {
      printReport(await loadLatestReport(root));
      break;
    }
    case "mcp": {
      startMcpServer(root);
      break;
    }
    case "--version":
    case "-v":
      process.stdout.write(`${VERSION}\n`);
      break;
    case "help":
    case "--help":
    case "-h":
      process.stdout.write(HELP);
      break;
    default:
      throw new Error(`Unknown command '${command}'. Run 'agentic-preflight --help'.`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unexpected error";
  process.stderr.write(`agentic-preflight: ${message}\n`);
  process.exitCode = 1;
});
