import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);
function routeScript(contents: string): string {
  // Git checkouts can use CRLF; Bash receives the same LF-normalized script.
  const routeStep = contents.replace(/\r\n/g, "\n").match(
    /        id: route\n        shell: bash\n        run: \|\n((?:          [^\n]*(?:\n|$))+)/,
  );
  if (!routeStep?.[1]) {
    throw new Error("Git Flow route validation script was not found in CI");
  }
  return routeStep[1].replace(/^ {10}/gm, "");
}

// Execute the actual CI route script rather than a second implementation of it.
const script = routeScript(workflow);

describe("Git Flow workflow line endings", () => {
  it.each(["\n", "\r\n"])("extracts the script with %j line endings", (ending) => {
    expect(routeScript(workflow.replace(/\r?\n/g, ending))).toBe(script);
    expect(script).not.toContain("\r");
  });
});

function checkRoute(head: string, base: string) {
  return spawnSync(
    "bash",
    ["--noprofile", "--norc", "-e", "-o", "pipefail", "-c", script],
    {
      encoding: "utf8",
      env: { ...process.env, GITHUB_HEAD_REF: head, GITHUB_BASE_REF: base },
    },
  );
}

// The route job runs on Ubuntu. Package checks on Windows need no Bash runtime.
describe.skipIf(process.platform === "win32")("Git Flow pull request routes", () => {
  it.each([
    ["feature/git-flow-workflow", "develop"],
    ["feature/docs/contributing", "develop"],
    ["release/0.4.0", "main"],
    ["release/0.4.0", "develop"],
    ["hotfix/0.3.1", "main"],
    ["hotfix/0.3.1", "develop"],
    ["main", "develop"],
  ])("allows %s -> %s", (head, base) => {
    const result = checkRoute(head, base);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Valid Git Flow pull request.");
    expect(result.stderr).toBe("");
  });

  it.each([
    ["feature/git-flow-workflow", "main"],
    ["develop", "main"],
    ["fix/unclassified", "develop"],
    ["release/0.4.0", "feature/git-flow-workflow"],
    ["feature/new-work", "release/0.4.0"],
    ["main", "main"],
    ["develop", "develop"],
    ["feature/", "develop"],
    ["release/", "main"],
    ["hotfix/", "main"],
    ["", "develop"],
    ["feature/new-work", ""],
  ])("rejects %s -> %s", (head, base) => {
    const result = checkRoute(head, base);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("::error::Invalid pull request route.");
    expect(result.stderr).toBe("");
  });
});
