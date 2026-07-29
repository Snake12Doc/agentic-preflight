import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CONFIG_FILE, initializeConfig, loadConfig } from "../src/config.js";

async function temporaryProject(): Promise<string> {
  return mkdtemp(join(tmpdir(), "agentic-preflight-config-"));
}

describe("configuration", () => {
  it("detects Maven projects when initializing", async () => {
    const root = await temporaryProject();
    await writeFile(join(root, "pom.xml"), "<project />");

    const path = await initializeConfig(root);
    const raw = JSON.parse(await readFile(path, "utf8")) as {
      checks: Record<string, { command: string }>;
    };

    expect(path).toBe(join(root, CONFIG_FILE));
    expect(raw.checks.test?.command).toBe("mvn");
    expect((await loadConfig(root)).checks.verify).toBeDefined();
  });

  it("rejects commands outside the executable allowlist", async () => {
    const root = await temporaryProject();
    await writeFile(
      join(root, CONFIG_FILE),
      JSON.stringify({
        version: 1,
        checks: {
          unsafe: { command: "sh", args: ["-c", "anything"] },
        },
        security: {
          allowedExecutables: ["node"],
          maxTimeoutMs: 1000,
        },
      }),
    );

    await expect(loadConfig(root)).rejects.toThrow("is not listed");
  });

  it("does not overwrite an existing configuration", async () => {
    const root = await temporaryProject();
    await writeFile(join(root, CONFIG_FILE), "{}\n");

    await expect(initializeConfig(root)).rejects.toThrow("already exists");
  });

  it("rejects a preflight with no checks", async () => {
    const root = await temporaryProject();
    await writeFile(
      join(root, CONFIG_FILE),
      JSON.stringify({
        version: 1,
        checks: {},
        security: {
          allowedExecutables: ["node"],
          maxTimeoutMs: 1000,
        },
      }),
    );

    await expect(loadConfig(root)).rejects.toThrow("At least one check is required");
  });
});
