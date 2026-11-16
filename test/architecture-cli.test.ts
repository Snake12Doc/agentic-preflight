import { constants } from "node:fs";
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import type { PreflightReport } from "../src/types.js";
import {
  cleanupTimeoutProcesses,
  expectTimeoutProcessesStopped,
  readTimeoutProcesses,
  timeoutProcessScript,
  type TimeoutProcesses,
} from "./helpers/timeout-process.js";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const fixtureRoot = join(repositoryRoot, "examples", "archsentinel-demo");
const preflightCli = join(repositoryRoot, "dist", "cli.js");
const archsentinelCli = process.env.ARCHSENTINEL_CLI ?? "";
const temporaryRoots: string[] = [];

async function copyFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "agentic preflight architecture-"));
  temporaryRoots.push(root);
  await cp(fixtureRoot, root, {
    recursive: true,
    filter: (source) => basename(source) !== ".agentic-preflight",
  });

  // Temporary copies have no ../../node_modules. Use the prepared checkout's
  // dependencies, without installing packages or creating platform-specific links.
  const config = await loadConfig(root);
  for (const check of Object.values(config.checks)) {
    check.command = process.execPath;
  }
  const testCheck = config.checks.test;
  const typecheck = config.checks.typecheck;
  if (!testCheck || !typecheck) {
    throw new Error("The architecture example must define test and typecheck");
  }
  testCheck.args[0] = join(repositoryRoot, "node_modules", "tsx", "dist", "cli.mjs");
  typecheck.args[0] = join(repositoryRoot, "node_modules", "typescript", "bin", "tsc");
  config.security.allowedExecutables = [process.execPath];
  await writeFile(join(root, "agentic-preflight.json"), `${JSON.stringify(config, null, 2)}\n`);
  return root;
}

function runPreflightCli(root: string, checks: string[] = []) {
  const result = spawnSync(process.execPath, [preflightCli, "check", ...checks], {
    cwd: root,
    env: {
      ...process.env,
      AGENTIC_PREFLIGHT_ROOT: root,
      ARCHSENTINEL_CLI: archsentinelCli,
    },
    shell: false,
    encoding: "utf8",
    timeout: 45_000,
    maxBuffer: 2_000_000,
  });
  expect(result.error).toBeUndefined();
  expect(result.signal).toBeNull();
  return result;
}

async function runPreflight(root: string, checks: string[] = []) {
  const result = runPreflightCli(root, checks);
  const report = JSON.parse(
    await readFile(join(root, ".agentic-preflight", "latest-report.json"), "utf8"),
  ) as PreflightReport;
  expect(report.root).toBe(root);
  return { result, report };
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

// This suite runs the real external CLI. Ordinary package checks stay offline
// and skip it unless the caller explicitly supplies a prepared ArchSentinel.
describe.skipIf(!archsentinelCli)("ArchSentinel CLI integration", () => {
  beforeAll(async () => {
    if (!isAbsolute(archsentinelCli)) {
      throw new Error("ARCHSENTINEL_CLI must be an absolute path to the built CLI");
    }
    await access(archsentinelCli, constants.R_OK);
    await access(preflightCli, constants.R_OK);
  });

  it("passes functional tests, types and architecture for a valid project", async () => {
    const root = await copyFixture();
    const { result, report } = await runPreflight(root);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Preflight passed.");
    expect(result.stderr).toBe("");
    expect(report.passed).toBe(true);
    expect(report.results).toMatchObject([
      { name: "test", status: "passed", exitCode: 0 },
      { name: "typecheck", status: "passed", exitCode: 0 },
      { name: "architecture", status: "passed", exitCode: 0 },
    ]);
    const architecture = JSON.parse(report.results[2]?.stdout ?? "{}");
    expect(architecture).toMatchObject({
      status: "PASS",
      summary: { files: 2, assignedFiles: 2, unassignedFiles: 0, dependencies: 1 },
      findings: [],
    });
  }, 60_000);

  it("fails architecture for a forbidden dependency while functional tests and types pass", async () => {
    const root = await copyFixture();
    const contractPath = join(root, "architecture.yaml");
    const contract = await readFile(contractPath, "utf8");
    await writeFile(
      contractPath,
      contract.replace(
        /^rules:/m,
        "    infrastructure:\n      paths: [src/infrastructure/**]\n      can_depend_on: []\nrules:",
      ),
    );
    await mkdir(join(root, "src", "infrastructure"));
    await writeFile(
      join(root, "src", "infrastructure", "storage.ts"),
      'export const storageDriver = "memory";\n',
    );
    const domainPath = join(root, "src", "domain", "order.ts");
    const domain = await readFile(domainPath, "utf8");
    await writeFile(domainPath, `import "../infrastructure/storage.js";\n${domain}`);

    const { result, report } = await runPreflight(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Preflight failed.");
    expect(result.stderr).toBe("");
    expect(report.passed).toBe(false);
    expect(report.results).toMatchObject([
      { name: "test", status: "passed", exitCode: 0 },
      { name: "typecheck", status: "passed", exitCode: 0 },
      { name: "architecture", status: "failed", exitCode: 1 },
    ]);
    const architecture = JSON.parse(report.results[2]?.stdout ?? "{}");
    expect(architecture.status).toBe("FAIL");
    expect(architecture.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "HEX-001",
          severity: "CRITICAL",
          file: "src/domain/order.ts",
          relatedFile: "src/infrastructure/storage.ts",
        }),
      ]),
    );
  }, 60_000);

  it("preserves a configuration error as exit 2 rather than an architecture violation", async () => {
    const root = await copyFixture();
    const contractPath = join(root, "architecture.yaml");
    const contract = await readFile(contractPath, "utf8");
    await writeFile(contractPath, contract.replace("style: hexagonal", "style: unsupported"));

    const { result, report } = await runPreflight(root);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Preflight failed.");
    expect(result.stdout).toContain('"status": "ERROR"');
    expect(result.stderr).toBe("");
    expect(report.passed).toBe(false);
    expect(report.results).toMatchObject([
      { name: "test", status: "passed", exitCode: 0 },
      { name: "typecheck", status: "passed", exitCode: 0 },
      { name: "architecture", status: "failed", exitCode: 2, stdout: "" },
    ]);
    const architectureError = JSON.parse(report.results[2]?.stderr ?? "{}");
    expect(architectureError).toMatchObject({
      status: "ERROR",
      error: {
        type: "configuration",
        path: "architecture.style",
        message: expect.any(String),
      },
    });
    expect(architectureError.error.message).not.toBe("");
    expect(architectureError).not.toHaveProperty("findings");
  }, 60_000);
});

describe("missing configured executable in the example CLI", () => {
  beforeAll(async () => {
    await access(preflightCli, constants.R_OK);
  });

  it.each([false, true])(
    "does not create or replace a report after a launch error (previous report: %s)",
    async (hasPreviousReport) => {
      const root = await copyFixture();
      const reportPath = join(root, ".agentic-preflight", "latest-report.json");
      let previousReport: string | undefined;
      if (hasPreviousReport) {
        const baseline = await runPreflight(root, ["test", "typecheck"]);
        expect(baseline.result.status).toBe(0);
        expect(baseline.report.passed).toBe(true);
        expect(baseline.report.results.map(({ name }) => name)).toEqual(["test", "typecheck"]);
        previousReport = await readFile(reportPath, "utf8");
      }

      const config = await loadConfig(root);
      const architecture = config.checks.architecture;
      if (!architecture) {
        throw new Error("The example must define an architecture check");
      }
      const missing = join(root, "missing-architecture-executable.exe");
      architecture.command = missing;
      config.security.allowedExecutables.push(missing);
      await writeFile(join(root, "agentic-preflight.json"), `${JSON.stringify(config, null, 2)}\n`);

      const result = runPreflightCli(root);

      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toContain(`agentic-preflight: Unable to run '${missing}':`);
      expect(result.stderr).toContain("ENOENT");
      if (previousReport !== undefined) {
        expect(await readFile(reportPath, "utf8")).toBe(previousReport);
      } else {
        await expect(readFile(reportPath, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
      }
    },
    60_000,
  );
});

describe("external check timeout in the example CLI", () => {
  it("persists timed_out, terminates descendants and continues remaining checks", async () => {
    const root = await copyFixture();
    let pids: TimeoutProcesses | undefined;
    try {
      const config = await loadConfig(root);
      const architecture = config.checks.architecture;
      if (!architecture) throw new Error("The example must define an architecture check");
      architecture.args = [timeoutProcessScript, "parent-exits"];
      architecture.timeoutMs = 1500;
      config.checks["after-timeout"] = {
        command: process.execPath,
        args: ["-e", "process.stdout.write('continued')"],
      };
      await writeFile(join(root, "agentic-preflight.json"), `${JSON.stringify(config, null, 2)}\n`);

      const { result, report } = await runPreflight(root);
      const check = report.results[2];
      pids = readTimeoutProcesses(check?.stdout ?? "");

      expect(result.status).toBe(1);
      expect(result.stdout).toContain("TIMED_OUT");
      expect(result.stdout).toContain("Preflight failed.");
      expect(result.stderr).toBe("");
      expect(report.passed).toBe(false);
      expect(report.results).toMatchObject([
        { name: "test", status: "passed", exitCode: 0 },
        { name: "typecheck", status: "passed", exitCode: 0 },
        { name: "architecture", status: "timed_out" },
        { name: "after-timeout", status: "passed", exitCode: 0, stdout: "continued" },
      ]);
      expect(check?.exitCode).not.toBe(99);
      await expectTimeoutProcessesStopped(pids);
    } finally {
      if (pids) await cleanupTimeoutProcesses(pids);
    }
  }, 20_000);
});
