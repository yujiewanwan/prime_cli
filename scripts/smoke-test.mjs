import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { URL, fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));

const cases = [
  {
    name: "root help",
    args: ["--help"],
    code: 0,
    stdout: "Usage: primecli",
  },
  {
    name: "wechat-touch help",
    args: ["wechat-touch", "--help"],
    code: 0,
    stdout: "items",
  },
  {
    name: "missing token",
    args: ["auth", "profile"],
    code: 1,
    stderr: "No saved token. Run `primecli auth login` first.",
  },
  {
    name: "invalid count",
    args: ["wechat-touch", "distribute", "--user-id", "1", "--count", "0"],
    code: 1,
    stderr: "Count must be at least 1.",
  },
  {
    name: "invalid date",
    args: ["hot-topics", "by-date", "--date", "2026-99-99"],
    code: 1,
    stderr: "Date must be a valid date.",
  },
];

const homeDir = await mkdtemp(join(tmpdir(), "primecli-smoke-"));

try {
  for (const testCase of cases) {
    const result = await runCli(testCase.args, homeDir);

    if (result.code !== testCase.code) {
      throw new Error(
        `${testCase.name}: expected exit code ${testCase.code}, got ${result.code}\n${result.stderr}`,
      );
    }

    if (testCase.stdout && !result.stdout.includes(testCase.stdout)) {
      throw new Error(
        `${testCase.name}: expected stdout to include ${JSON.stringify(testCase.stdout)}\n${result.stdout}`,
      );
    }

    if (testCase.stderr && !result.stderr.includes(testCase.stderr)) {
      throw new Error(
        `${testCase.name}: expected stderr to include ${JSON.stringify(testCase.stderr)}\n${result.stderr}`,
      );
    }
  }
} finally {
  await rm(homeDir, { force: true, recursive: true });
}

function runCli(args, homeDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      env: {
        ...process.env,
        HOME: homeDir,
        USERPROFILE: homeDir,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}
