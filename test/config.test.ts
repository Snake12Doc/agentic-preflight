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

  it("detects pnpm and initializes checks for available scripts", async () => {
    const root = await temporaryProject();
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        packageManager: "pnpm@11.21.0",
        scripts: {
          test: "vitest run",
          lint: "eslint .",
          typecheck: "tsc --noEmit",
          build: "tsc",
          "format:check": "prettier --check .",
          dev: "vite",
        },
      }),
    );

    await initializeConfig(root);
    const config = await loadConfig(root);

    expect(config.security.allowedExecutables).toEqual(["corepack"]);
    expect(config.checks).toEqual({
      test: {
        command: "corepack",
        args: ["pnpm", "run", "test"],
        description: "Run the test suite",
      },
      lint: {
        command: "corepack",
        args: ["pnpm", "run", "lint"],
        description: "Run static analysis",
      },
      typecheck: {
        command: "corepack",
        args: ["pnpm", "run", "typecheck"],
        description: "Run type checking",
      },
      build: {
        command: "corepack",
        args: ["pnpm", "run", "build"],
        description: "Build the project",
      },
      "format-check": {
        command: "corepack",
        args: ["pnpm", "run", "format:check"],
        description: "Check formatting",
      },
    });
  });

  it("detects pnpm from its lockfile", async () => {
    const root = await temporaryProject();
    await writeFile(join(root, "package.json"), JSON.stringify({ scripts: { test: "vitest" } }));
    await writeFile(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");

    await initializeConfig(root);

    expect((await loadConfig(root)).checks.test).toMatchObject({
      command: "corepack",
      args: ["pnpm", "run", "test"],
    });
  });

  it("uses npm and only includes scripts that exist", async () => {
    const root = await temporaryProject();
    await writeFile(join(root, "package.json"), JSON.stringify({ scripts: { build: "tsc" } }));

    await initializeConfig(root);
    const config = await loadConfig(root);

    expect(config.security.allowedExecutables).toEqual(["npm"]);
    expect(config.checks).toEqual({
      build: {
        command: "npm",
        args: ["run", "build"],
        description: "Build the project",
      },
    });
  });

  it("falls back to a Git check when no standard package scripts exist", async () => {
    const root = await temporaryProject();
    await writeFile(join(root, "package.json"), JSON.stringify({ scripts: { dev: "vite" } }));

    await initializeConfig(root);
    const config = await loadConfig(root);

    expect(config.checks).toEqual({
      status: {
        command: "git",
        args: ["status", "--short"],
        description: "Confirm that Git can inspect the project",
      },
    });
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
