import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import type {
  CheckDefinition,
  CheckResult,
  PreflightConfig,
  PreflightReport,
} from "./types.js";

const OUTPUT_LIMIT = 200_000;
const REPORT_DIRECTORY = ".agentic-preflight";
const REPORT_FILE = "latest-report.json";

interface ProcessResult {
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
}

function appendLimited(current: string, chunk: Buffer): string {
  if (current.length >= OUTPUT_LIMIT) {
    return current;
  }
  const next = current + chunk.toString("utf8");
  if (next.length <= OUTPUT_LIMIT) {
    return next;
  }
  return `${next.slice(0, OUTPUT_LIMIT)}\n[output truncated]`;
}

async function validateLocalExecutable(root: string, command: string): Promise<void> {
  // Absolute executables are trusted only when explicitly allowlisted by the config.
  if (isAbsolute(command) || !command.includes("/")) {
    return;
  }
  const executable = resolve(root, command);
  let realRoot: string;
  let realExecutable: string;
  try {
    [realRoot, realExecutable] = await Promise.all([realpath(root), realpath(executable)]);
  } catch {
    throw new Error(`Executable '${command}' does not exist or cannot be resolved`);
  }
  const pathFromRoot = relative(realRoot, realExecutable);
  if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) {
    throw new Error(`Executable '${command}' resolves outside the project root`);
  }
}

export async function runProcess(
  root: string,
  command: string,
  args: string[],
  timeoutMs: number,
): Promise<ProcessResult> {
  await validateLocalExecutable(root, command);

  return new Promise((resolvePromise, reject) => {
    const startedAt = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;
    const detached = process.platform !== "win32";

    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      shell: false,
      detached,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let forceKillTimer: NodeJS.Timeout | undefined;
    const kill = (signal: NodeJS.Signals) => {
      if (detached && child.pid) {
        try {
          process.kill(-child.pid, signal);
          return;
        } catch {
          // Fall back to killing the immediate process below.
        }
      }
      child.kill(signal);
    };

    const killWindowsTree = () => {
      if (!child.pid) {
        return;
      }
      const systemRoot = process.env.SystemRoot ?? "C:\\Windows";
      const taskkill = join(systemRoot, "System32", "taskkill.exe");
      const killer = spawn(taskkill, ["/pid", String(child.pid), "/t", "/f"], {
        shell: false,
        stdio: "ignore",
      });
      killer.on("error", () => child.kill("SIGKILL"));
      killer.unref();
    };

    const timer = setTimeout(() => {
      timedOut = true;
      if (process.platform === "win32") {
        killWindowsTree();
      } else {
        kill("SIGTERM");
        forceKillTimer = setTimeout(() => kill("SIGKILL"), 500);
      }
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout = appendLimited(stdout, chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = appendLimited(stderr, chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      if (forceKillTimer) clearTimeout(forceKillTimer);
      if (!settled) {
        settled = true;
        reject(new Error(`Unable to run '${command}': ${error.message}`));
      }
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      if (forceKillTimer) clearTimeout(forceKillTimer);
      if (!settled) {
        settled = true;
        resolvePromise({
          exitCode,
          timedOut,
          durationMs: Date.now() - startedAt,
          stdout: stdout.trimEnd(),
          stderr: stderr.trimEnd(),
        });
      }
    });
  });
}

async function runCheck(
  root: string,
  name: string,
  definition: CheckDefinition,
  config: PreflightConfig,
): Promise<CheckResult> {
  if (!config.security.allowedExecutables.includes(definition.command)) {
    throw new Error(`Executable '${definition.command}' is not allowed`);
  }
  const timeoutMs = Math.min(
    definition.timeoutMs ?? config.security.maxTimeoutMs,
    config.security.maxTimeoutMs,
  );
  const result = await runProcess(root, definition.command, definition.args, timeoutMs);

  return {
    name,
    ...(definition.description ? { description: definition.description } : {}),
    status: result.timedOut ? "timed_out" : result.exitCode === 0 ? "passed" : "failed",
    exitCode: result.exitCode,
    durationMs: result.durationMs,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

export async function runChecks(
  root: string,
  config: PreflightConfig,
  requestedNames?: string[],
): Promise<PreflightReport> {
  const names = requestedNames?.length ? requestedNames : Object.keys(config.checks);
  const unknown = names.filter((name) => !(name in config.checks));
  if (unknown.length) {
    throw new Error(`Unknown checks: ${unknown.join(", ")}`);
  }

  const startedAt = new Date();
  const results: CheckResult[] = [];
  for (const name of names) {
    const definition = config.checks[name];
    if (definition) {
      results.push(await runCheck(root, name, definition, config));
    }
  }

  return {
    version: 1,
    root,
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    passed: results.every((result) => result.status === "passed"),
    results,
  };
}

export async function saveReport(root: string, report: PreflightReport): Promise<string> {
  const directory = join(root, REPORT_DIRECTORY);
  await mkdir(directory, { recursive: true });
  const path = join(directory, REPORT_FILE);
  const temporaryPath = join(directory, `${REPORT_FILE}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporaryPath, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
    await rename(temporaryPath, path);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
  return path;
}

export async function loadLatestReport(root: string): Promise<PreflightReport> {
  const path = join(root, REPORT_DIRECTORY, REPORT_FILE);
  try {
    return JSON.parse(await readFile(path, "utf8")) as PreflightReport;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error("No preflight report exists yet. Run a check first.");
    }
    throw error;
  }
}
