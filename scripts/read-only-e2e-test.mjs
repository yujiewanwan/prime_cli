import { mkdtemp, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL, fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const username = process.env.PRIMECLI_E2E_USERNAME ?? "test";
const password = process.env.PRIMECLI_E2E_PASSWORD;

if (!password) {
  throw new Error("PRIMECLI_E2E_PASSWORD is required.");
}

const homeDir = await mkdtemp(join(tmpdir(), "primecli-e2e-"));
const skipped = [];

try {
  await run("auth login", [
    "auth",
    "login",
    "--username",
    username,
    "--password",
    password,
  ]);
  await runJson("auth profile", ["auth", "profile"]);
  await runJson("company search", ["company", "search", "--name", "test"]);
  await runJson("wechat touch stats", ["wechat-touch", "stats"]);
  await runJson("wechat touch daily todo summary", [
    "wechat-touch",
    "daily-todo-summary",
  ]);
  await runJson("wechat touch daily todo", [
    "wechat-touch",
    "daily-todo",
    "--size",
    "1",
  ]);
  await runJson("wechat touch today stats", ["wechat-touch", "today-stats"]);
  await runJson("wechat touch friend owners", [
    "wechat-touch",
    "friend-owners",
  ]);
  const items = await runJson("wechat touch items", [
    "wechat-touch",
    "items",
    "--size",
    "1",
  ]);
  const accounts = await runJson("wechat official accounts", [
    "wechat-official",
    "articles",
    "accounts",
  ]);
  const pendingConversations = await runJson("pending WeCom conversations", [
    "wecom-conversations",
    "pending",
    "--limit",
    "1",
  ]);
  await runDependentQuery(
    "wechat touch item",
    findValue(items, ["id", "itemId"]),
    (id) => ["wechat-touch", "item", String(id)],
  );
  await runDependentQuery(
    "wechat official articles by fakeid",
    findValue(accounts, ["fakeid", "fakeId"]),
    (fakeid) => [
      "wechat-official",
      "articles",
      "by-fakeid",
      "--fakeids",
      String(fakeid),
    ],
  );
  await runDependentQuery(
    "WeCom conversation context",
    findValue(pendingConversations, ["conversationId", "id"]),
    (id) => ["wecom-conversations", "context", "--conversation-id", String(id)],
  );
} finally {
  await rm(homeDir, { force: true, recursive: true });
}

console.log("Read-only end-to-end verification passed.");
if (skipped.length > 0) {
  console.log(
    `Skipped because the test account has no matching data: ${skipped.join(", ")}`,
  );
}

async function runDependentQuery(name, value, buildArgs) {
  if (value === undefined) {
    skipped.push(name);
    return;
  }

  await runJson(name, buildArgs(value));
}

async function runJson(name, args) {
  const result = await run(name, args);
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(
      `${name}: expected JSON output, received ${JSON.stringify(result.stdout)}`,
    );
  }
}

async function run(name, args) {
  const result = await runCli(args);
  if (result.code !== 0) {
    throw new Error(`${name}: exited with ${result.code}\n${result.stderr}`);
  }

  return result;
}

function findValue(value, keys) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findValue(item, keys);
      if (found !== undefined) return found;
    }
    return undefined;
  }

  if (!value || typeof value !== "object") return undefined;

  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" || typeof candidate === "number") {
      return candidate;
    }
  }

  for (const nested of Object.values(value)) {
    const found = findValue(nested, keys);
    if (found !== undefined) return found;
  }

  return undefined;
}

function runCli(args) {
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
