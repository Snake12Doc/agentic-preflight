export type CheckStatus = "passed" | "failed" | "timed_out";

export interface CheckDefinition {
  command: string;
  args: string[];
  description?: string;
  timeoutMs?: number;
}

export interface PreflightConfig {
  version: 1;
  checks: Record<string, CheckDefinition>;
  security: {
    allowedExecutables: string[];
    maxTimeoutMs: number;
  };
}

export interface CheckResult {
  name: string;
  description?: string;
  status: CheckStatus;
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
}

export interface PreflightReport {
  version: 1;
  root: string;
  startedAt: string;
  finishedAt: string;
  passed: boolean;
  results: CheckResult[];
}
