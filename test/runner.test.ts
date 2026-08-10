import { mkdtemp, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runChecks } from "../src/runner.js";
import type { PreflightConfig } from "../src/types.js";

async function temporaryProject(): Promise<string> {
  return mkdtemp(join(tmpdir(), "agentic-preflight-runner-"));
}

function configFor(script: string, timeoutMs = 5000): PreflightConfig {
  return {
    version: 1,
    checks: {
      example: {
        command: process.execPath,
        args: ["-e", script],
        timeoutMs,
      },
    },
    security: {
      allowedExecutables: [process.execPath],
      maxTimeoutMs: timeoutMs,
    },
  };
}

describe("check runner", () => {
  it("captures a successful check", async () => {
    const report = await runChecks(
      await temporaryProject(),
      configFor("process.stdout.write('ok')"),
    );

    expect(report.passed).toBe(true);
    expect(report.results[0]).toMatchObject({
      name: "example",
      status: "passed",
      exitCode: 0,
      stdout: "ok",
    });
  });

  it("defaults non-interactive checks to a CI environment", async () => {
    const report = await runChecks(
      await temporaryProject(),
      configFor("process.stdout.write(process.env.CI ?? '')"),
    );

    expect(report.results[0]?.stdout).toBe(process.env.CI ?? "true");
  });

  it("captures a failed check without throwing", async () => {
    const report = await runChecks(
      await temporaryProject(),
      configFor("process.stderr.write('broken'); process.exit(2)"),
    );

    expect(report.passed).toBe(false);
    expect(report.results[0]).toMatchObject({
      status: "failed",
      exitCode: 2,
      stderr: "broken",
    });
  });

  it("terminates checks that exceed their timeout", async () => {
    const report = await runChecks(
      await temporaryProject(),
      configFor("setTimeout(() => {}, 10000)", 50),
    );

    expect(report.passed).toBe(false);
    expect(report.results[0]?.status).toBe("timed_out");
  });

  it("force kills checks that ignore the termination signal", async () => {
    const startedAt = Date.now();
    const report = await runChecks(
      await temporaryProject(),
      configFor("process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)", 100),
    );

    expect(report.results[0]?.status).toBe("timed_out");
    expect(Date.now() - startedAt).toBeLessThan(2000);
  });

  it.runIf(process.platform !== "win32")(
    "rejects a relative executable symlink that escapes the project",
    async () => {
      const root = await temporaryProject();
      await symlink(process.execPath, join(root, "node-link"));
      const config: PreflightConfig = {
        version: 1,
        checks: {
          example: { command: "./node-link", args: ["--version"] },
        },
        security: {
          allowedExecutables: ["./node-link"],
          maxTimeoutMs: 1000,
        },
      };

      await expect(runChecks(root, config)).rejects.toThrow("resolves outside");
    },
  );

  it("rejects unknown check names", async () => {
    await expect(
      runChecks(await temporaryProject(), configFor(""), ["missing"]),
    ).rejects.toThrow("Unknown checks: missing");
  });
});
