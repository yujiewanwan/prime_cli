import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL, fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const testHome = await mkdtemp(join(tmpdir(), "primecli-retired-"));
const requests = [];
const server = createServer((request, response) => {
  requests.push({ method: request.method, url: request.url });
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ code: 200, data: { marker: "retained" } }));
});

try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  await mkdir(join(testHome, ".config", "primecli"), { recursive: true });
  await writeFile(
    join(testHome, ".config", "primecli", "config.json"),
    JSON.stringify({ token: "test-token", role: "SUPER_ADMIN", baseUrl }),
  );
  const options = {
    env: {
      ...process.env,
      HOME: testHome,
      USERPROFILE: testHome,
      PRIMECLI_BASE_URL: baseUrl,
      NO_PROXY: "127.0.0.1",
    },
    timeout: 10000,
  };
  const help = await run(
    process.execPath,
    [cliPath, "wechat-touch", "--help"],
    options,
  );
  assert.doesNotMatch(help.stdout, /distribute|distribution-users/);
  for (const args of [
    ["distribute", "--user-id", "1", "--count", "1"],
    ["distribution-users"],
  ]) {
    await assert.rejects(
      run(process.execPath, [cliPath, "wechat-touch", ...args], options),
      (error) => {
        assert.equal(error.code, 1);
        assert.ok(error.stderr.includes(`unknown command '${args[0]}'`));
        return true;
      },
    );
    assert.deepEqual(
      requests,
      [],
      "retired commands must not send HTTP requests",
    );
  }
  for (const args of [["stats"], ["items"], ["item", "123"]]) {
    const result = await run(
      process.execPath,
      [cliPath, "wechat-touch", ...args],
      options,
    );
    assert.deepEqual(JSON.parse(result.stdout), { marker: "retained" });
  }
  assert.deepEqual(requests, [
    { method: "GET", url: "/api/wechat-touch/stats" },
    { method: "GET", url: "/api/wechat-touch/items?page=1&size=50" },
    { method: "GET", url: "/api/wechat-touch/items/123" },
  ]);
  console.log("Retired commands reject without HTTP; retained queries passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
  await rm(testHome, { recursive: true, force: true });
}
