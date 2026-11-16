import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";

export const timeoutProcessScript = fileURLToPath(
  new URL("../fixtures/timeout-process.mjs", import.meta.url),
);

export interface TimeoutProcesses {
  parentPid: number;
  childPid: number;
}

export function readTimeoutProcesses(stdout: string): TimeoutProcesses {
  const ready = stdout.match(/^TIMEOUT_READY (.+)$/m);
  if (!ready?.[1]) {
    throw new Error(`Timeout fixture did not confirm that both processes started: ${stdout}`);
  }
  const pids = JSON.parse(ready[1]) as TimeoutProcesses;
  for (const pid of [pids.parentPid, pids.childPid]) {
    if (!Number.isInteger(pid) || pid <= 0) {
      throw new Error("Invalid timeout fixture PID");
    }
  }
  return pids;
}

async function isRunning(pid: number): Promise<boolean> {
  try {
    process.kill(pid, 0);
    if (process.platform === "linux") {
      // A terminated orphan may remain a zombie until the host reaps it.
      const stat = await readFile(`/proc/${pid}/stat`, "utf8");
      return stat.slice(stat.lastIndexOf(")") + 2).split(" ")[0] !== "Z";
    }
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ESRCH" || code === "ENOENT") return false;
    throw error;
  }
}

export async function expectTimeoutProcessesStopped(pids: TimeoutProcesses): Promise<void> {
  for (const pid of [pids.parentPid, pids.childPid]) {
    await expect.poll(() => isRunning(pid), { timeout: 5000, interval: 25 }).toBe(false);
  }
}

export async function cleanupTimeoutProcesses(pids: TimeoutProcesses): Promise<void> {
  for (const pid of [pids.childPid, pids.parentPid]) {
    if (await isRunning(pid)) {
      try {
        process.kill(pid, "SIGKILL");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
      }
    }
  }
  await expectTimeoutProcessesStopped(pids);
}
