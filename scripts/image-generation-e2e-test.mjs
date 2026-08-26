import { access, mkdtemp, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL, fileURLToPath } from "node:url";

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const username = process.env.PRIMECLI_E2E_USERNAME ?? "test";
const password = process.env.PRIMECLI_E2E_PASSWORD;
const referenceImage = process.env.PRIMECLI_E2E_REFERENCE_IMAGE;
const prompt =
  process.env.PRIMECLI_E2E_IMAGE_PROMPT ??
  "Create a new modern brand visual inspired by the reference image. No text or watermark.";

if (!password) {
  throw new Error("PRIMECLI_E2E_PASSWORD is required.");
}
if (!referenceImage) {
  throw new Error("PRIMECLI_E2E_REFERENCE_IMAGE is required.");
}

await access(referenceImage, constants.R_OK);
const homeDir = await mkdtemp(join(tmpdir(), "primecli-image-e2e-"));

try {
  await run("auth login", [
    "auth",
    "login",
    "--username",
    username,
    "--password",
    password,
  ]);
  const result = await run("reference image generation", [
    "image-generations",
    "create",
    "--prompt",
    prompt,
    "--reference-image",
    referenceImage,
  ]);
  const image = JSON.parse(result.stdout);
  if (!image || typeof image.url !== "string" || !image.url) {
    throw new Error(
      "reference image generation: response does not contain an image URL.",
    );
  }

  console.log(`Reference image generation passed: ${image.url}`);
} finally {
  await rm(homeDir, { force: true, recursive: true });
}

async function run(name, args) {
  const result = await runCli(args);
  if (result.code !== 0) {
    throw new Error(`${name}: exited with ${result.code}\n${result.stderr}`);
  }
  return result;
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
