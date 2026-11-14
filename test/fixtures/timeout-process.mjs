import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Bound fixture lifetime even if the runner or a test fails to clean it up.
// Tests reject this exit code rather than mistaking self-exit for termination.
setTimeout(() => process.exit(99), 15_000);
setInterval(() => {}, 1000);

if (process.argv[2] === "child") {
  process.on("SIGTERM", () => {});
  process.send?.("ready");
} else {
  if (process.argv[2] === "ignore-term") {
    process.on("SIGTERM", () => console.log("IGNORED_SIGTERM"));
  }
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "child"], {
    stdio: ["ignore", "ignore", "ignore", "ipc"],
    shell: false,
  });
  child.on("error", (error) => {
    console.error(error.message);
    process.exit(98);
  });
  child.once("message", () => {
    console.log(`TIMEOUT_READY ${JSON.stringify({ parentPid: process.pid, childPid: child.pid })}`);
    child.disconnect();
  });
}
