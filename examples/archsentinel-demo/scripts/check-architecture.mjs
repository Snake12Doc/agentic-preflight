import { spawnSync } from "node:child_process";
import { isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const cli = process.env.ARCHSENTINEL_CLI;

if (!cli || !isAbsolute(cli)) {
  console.error("Set ARCHSENTINEL_CLI to the absolute path of the built ArchSentinel dist/cli.js.");
  process.exitCode = 2;
} else {
  const result = spawnSync(
    process.execPath,
    [cli, "check", "--language", "typescript", "--format", "json"],
    {
      cwd: fileURLToPath(new URL("../", import.meta.url)),
      shell: false,
      stdio: "inherit",
    },
  );

  if (result.error) {
    console.error(`Unable to run ArchSentinel: ${result.error.message}`);
  }
  process.exitCode = result.status ?? 2;
}
