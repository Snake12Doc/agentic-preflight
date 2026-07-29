import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { loadConfig } from "./config.js";
import { loadLatestReport, runChecks, saveReport } from "./runner.js";
import { VERSION } from "./version.js";

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

export function createMcpServer(root: string): McpServer {
  const server = new McpServer({
    name: "agentic-preflight",
    version: VERSION,
  });

  server.registerTool(
    "list_checks",
    {
      title: "List configured quality checks",
      description: "List the checks that agents are allowed to run for this project.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async () => {
      try {
        const config = await loadConfig(root);
        const checks = Object.entries(config.checks).map(([name, check]) => ({
          name,
          description: check.description ?? "",
          command: check.command,
          args: check.args,
        }));
        return {
          content: [{ type: "text", text: JSON.stringify(checks, null, 2) }],
          structuredContent: { checks },
        };
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "run_check",
    {
      title: "Run one quality check",
      description: "Run one named, allowlisted project check and persist its report.",
      inputSchema: z.object({
        name: z.string().trim().min(1).max(100),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
    async ({ name }) => {
      try {
        const config = await loadConfig(root);
        const report = await runChecks(root, config, [name]);
        await saveReport(root, report);
        return {
          content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
          structuredContent: { report },
          isError: !report.passed,
        };
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "run_preflight",
    {
      title: "Run the project preflight",
      description: "Run all configured checks, or a selected subset, and persist the report.",
      inputSchema: z.object({
        checks: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
    async ({ checks }) => {
      try {
        const config = await loadConfig(root);
        const report = await runChecks(root, config, checks);
        await saveReport(root, report);
        return {
          content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
          structuredContent: { report },
          isError: !report.passed,
        };
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "latest_report",
    {
      title: "Read the latest preflight report",
      description: "Return the most recently persisted project quality report.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      },
    },
    async () => {
      try {
        const report = await loadLatestReport(root);
        return {
          content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
          structuredContent: { report },
        };
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  return server;
}

export function startMcpServer(root: string) {
  const handle = serveStdio(() => createMcpServer(root));
  process.on("SIGINT", () => {
    void handle.close();
  });
  return handle;
}
