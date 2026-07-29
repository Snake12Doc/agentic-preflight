import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { CONFIG_FILE } from "../src/config.js";

const clients: Client[] = [];

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.close()));
});

describe("MCP server", () => {
  it("lists and executes allowlisted checks over stdio", async () => {
    const root = await mkdtemp(join(tmpdir(), "agentic-preflight-mcp-"));
    await writeFile(
      join(root, CONFIG_FILE),
      JSON.stringify({
        version: 1,
        checks: {
          smoke: {
            command: process.execPath,
            args: ["-e", "process.stdout.write('ready')"],
            description: "Smoke test",
          },
        },
        security: {
          allowedExecutables: [process.execPath],
          maxTimeoutMs: 5000,
        },
      }),
    );

    const client = new Client({ name: "integration-test", version: "1.0.0" });
    clients.push(client);
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [resolve("dist/cli.js"), "mcp"],
        cwd: root,
      }),
    );

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toContain("run_preflight");

    const result = await client.callTool({
      name: "run_check",
      arguments: { name: "smoke" },
    });
    expect(result.isError).not.toBe(true);
    expect(JSON.stringify(result.structuredContent)).toContain("ready");
  });
});
