import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import * as z from "zod/v4";
import type { PreflightConfig } from "./types.js";

export const CONFIG_FILE = "agentic-preflight.json";

const checkDefinitionSchema = z
  .object({
    command: z.string().trim().min(1),
    args: z.array(z.string()).default([]),
    description: z.string().trim().min(1).optional(),
    timeoutMs: z.int().positive().optional(),
  })
  .strict();

const configSchema = z
  .object({
    version: z.literal(1),
    checks: z
      .record(z.string().regex(/^[a-z0-9][a-z0-9-]*$/), checkDefinitionSchema)
      .refine((checks) => Object.keys(checks).length > 0, "At least one check is required"),
    security: z
      .object({
        allowedExecutables: z.array(z.string().trim().min(1)).min(1),
        maxTimeoutMs: z.int().positive().max(30 * 60 * 1000),
      })
      .strict(),
  })
  .strict();

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const nodeChecks = [
  ["test", "test", "Run the test suite"],
  ["lint", "lint", "Run static analysis"],
  ["typecheck", "typecheck", "Run type checking"],
  ["build", "build", "Build the project"],
  ["format-check", "format:check", "Check formatting"],
  ["integration", "test:integration", "Run integration tests"],
  ["e2e", "test:e2e", "Run end-to-end tests"],
] as const;

async function createNodeConfig(root: string): Promise<PreflightConfig | undefined> {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
    packageManager?: unknown;
    scripts?: unknown;
  };
  const scripts =
    packageJson.scripts && typeof packageJson.scripts === "object"
      ? (packageJson.scripts as Record<string, unknown>)
      : {};

  let packageManager =
    typeof packageJson.packageManager === "string"
      ? packageJson.packageManager.split("@", 1)[0]
      : undefined;
  if (!packageManager || !["npm", "pnpm", "yarn"].includes(packageManager)) {
    packageManager = (await exists(join(root, "pnpm-lock.yaml")))
      ? "pnpm"
      : (await exists(join(root, "yarn.lock")))
        ? "yarn"
        : "npm";
  }

  const command = packageManager === "npm" ? "npm" : "corepack";
  const managerArgs = packageManager === "npm" ? [] : [packageManager];
  const checks = Object.fromEntries(
    nodeChecks
      .filter(([, script]) => typeof scripts[script] === "string")
      .map(([name, script, description]) => [
        name,
        {
          command,
          args: [...managerArgs, "run", script],
          description,
        },
      ]),
  );

  if (Object.keys(checks).length === 0) return undefined;

  return {
    version: 1,
    checks,
    security: {
      allowedExecutables: [command],
      maxTimeoutMs: 300_000,
    },
  };
}

export async function createDefaultConfig(root: string): Promise<PreflightConfig> {
  if (await exists(join(root, "pom.xml"))) {
    const wrapper = (await exists(join(root, "mvnw"))) ? "./mvnw" : "mvn";
    return {
      version: 1,
      checks: {
        test: {
          command: wrapper,
          args: ["test"],
          description: "Run the Maven test suite",
        },
        verify: {
          command: wrapper,
          args: ["verify", "-DskipTests"],
          description: "Run the Maven verification lifecycle",
        },
      },
      security: {
        allowedExecutables: [wrapper],
        maxTimeoutMs: 300_000,
      },
    };
  }

  if (await exists(join(root, "package.json"))) {
    const nodeConfig = await createNodeConfig(root);
    if (nodeConfig) return nodeConfig;
  }

  return {
    version: 1,
    checks: {
      status: {
        command: "git",
        args: ["status", "--short"],
        description: "Confirm that Git can inspect the project",
      },
    },
    security: {
      allowedExecutables: ["git"],
      maxTimeoutMs: 60_000,
    },
  };
}

export async function initializeConfig(root: string): Promise<string> {
  const path = join(root, CONFIG_FILE);
  if (await exists(path)) {
    throw new Error(`${CONFIG_FILE} already exists`);
  }

  const config = await createDefaultConfig(root);
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, { flag: "wx" });
  return path;
}

export async function loadConfig(root: string): Promise<PreflightConfig> {
  const path = join(root, CONFIG_FILE);
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`${CONFIG_FILE} was not found in ${root}. Run 'agentic-preflight init' first.`);
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${CONFIG_FILE} contains invalid JSON`);
  }

  const result = configSchema.safeParse(parsed);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid ${CONFIG_FILE}: ${details}`);
  }

  const config = result.data as PreflightConfig;
  for (const [name, check] of Object.entries(config.checks)) {
    if (!config.security.allowedExecutables.includes(check.command)) {
      throw new Error(
        `Check '${name}' uses '${check.command}', which is not listed in security.allowedExecutables`,
      );
    }
    if (check.timeoutMs && check.timeoutMs > config.security.maxTimeoutMs) {
      throw new Error(`Check '${name}' exceeds security.maxTimeoutMs`);
    }
  }

  return config;
}
